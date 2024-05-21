import { auth, Client } from "@getalby/sdk";
import {
  CreateSwapParams,
  CreateSwapResponse,
  Invoice,
  RequestOptions,
  SwapInfoResponse,
  Token,
} from "@getalby/sdk/dist/types";
import browser from "webextension-polyfill";
import { decryptData, encryptData } from "~/common/lib/crypto";
import { Account, GetAccountInformationResponses, OAuthToken } from "~/types";
import state from "../state";
import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
  ConnectorTransaction,
  ConnectPeerResponse,
  GetBalanceResponse,
  GetInfoResponse,
  GetTransactionsResponse,
  KeysendArgs,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
  SendPaymentArgs,
  SendPaymentResponse,
  SignMessageArgs,
  SignMessageResponse,
  WebLNNode,
} from "./connector.interface";

interface Config {
  login: string;
  password: string;
  url: string;
  oAuthToken: OAuthToken | undefined;
}

interface UserDetails {
  identifier: string;
  email: string;
  name: string;
  avatar: string | null;
  lightning_address: string;
  shared_node: boolean;
  node_required: boolean;
  limits: {
    max_send_volume: number;
    max_send_amount: number;
    max_receive_volume: number;
    max_receive_amount: number;
    max_account_balance: number;
    max_volume_period_in_days: number;
  };
  node_type: string;
  node_connection_error_count: number;
}

export default class Alby implements Connector {
  private account: Account;
  private config: Config;
  private _client: Client | undefined;
  private _authUser: auth.OAuth2User | undefined;

  constructor(account: Account, config: Config) {
    this.account = account;
    this.config = config;
  }

  async init() {
    try {
      this._authUser = await this.authorize();
      this._client = new Client(this._authUser, this._getRequestOptions());
    } catch (error) {
      console.error("Failed to initialize alby connector", error);
      this._authUser = undefined;
      this._client = undefined;
      await this.unload();
    }
  }

  getOAuthToken(): OAuthToken | undefined {
    return this.config.oAuthToken;
  }

  unload() {
    return Promise.resolve();
  }

  get supportedMethods() {
    return [
      "getInfo",
      "keysend",
      "makeInvoice",
      "sendPayment",
      "sendPaymentAsync",
      "getBalance",
      "getTransactions",
    ];
  }

  // not yet implemented
  async connectPeer(): Promise<ConnectPeerResponse> {
    console.error(
      `${this.constructor.name} does not implement the connectPeer call`
    );
    throw new Error("Not yet supported with the currently used account.");
  }

  async getTransactions(): Promise<GetTransactionsResponse> {
    const invoicesResponse = (await this._request((client) =>
      client.invoices({})
    )) as Invoice[];

    const transactions: ConnectorTransaction[] = invoicesResponse.map(
      (invoice, index): ConnectorTransaction => ({
        custom_records: invoice.custom_records,
        id: `${invoice.payment_request}-${index}`,
        memo: invoice.comment || invoice.memo,
        preimage: invoice.preimage ?? "",
        payment_hash: invoice.payment_hash,
        settled: invoice.settled,
        settleDate: new Date(invoice.settled_at).getTime(),
        totalAmount: invoice.amount,
        type: invoice.type == "incoming" ? "received" : "sent",
      })
    );

    return {
      data: {
        transactions,
      },
    };
  }

  async getInfo(): Promise<
    GetInfoResponse<WebLNNode & GetAccountInformationResponses>
  > {
    try {
      const node_required = await this._isNodeRequired();
      const info = await this._request((client) =>
        client.accountInformation({})
      );

      const returnValue = {
        data: {
          ...info,
          node_required: node_required,
          alias: "🐝 getalby.com",
        },
      };

      return returnValue;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getBalance(): Promise<GetBalanceResponse> {
    const { balance } = await this._request((client) =>
      client.accountBalance({})
    );

    return {
      data: {
        balance,
      },
    };
  }

  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    const data = await this._request((client) =>
      client.sendPayment({
        invoice: args.paymentRequest,
      })
    );

    return {
      data: {
        preimage: data.payment_preimage,
        paymentHash: data.payment_hash,
        route: { total_amt: data.amount, total_fees: data.fee },
      },
    };
  }

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    const data = await this._request((client) =>
      client.keysend({
        destination: args.pubkey,
        amount: args.amount,
        customRecords: args.customRecords,
      })
    );

    return {
      data: {
        preimage: data.payment_preimage,
        paymentHash: data.payment_hash,
        route: { total_amt: data.amount, total_fees: data.fee },
      },
    };
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    let paid = false;
    try {
      const invoice = await this._request((client) =>
        client.getInvoice(args.paymentHash)
      );
      paid = !!invoice?.settled;
    } catch (error) {
      console.error(error);
    }
    return {
      data: {
        paid,
      },
    };
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    // signMessage requires proof of ownership of a non-custodial node
    // this is not the case in the Alby connector which connects to Lndhub
    throw new Error(
      "SignMessage is not supported by Alby accounts. Generate a Master Key to use LNURL auth."
    );
  }

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    const data = await this._request((client) =>
      client.createInvoice({
        amount: parseInt(args.amount.toString()),
        description: args.memo,
      })
    );

    return {
      data: {
        paymentRequest: data.payment_request,
        rHash: data.payment_hash,
      },
    };
  }

  async getSwapInfo(): Promise<SwapInfoResponse> {
    const result = await this._request((client) => client.getSwapInfo());
    return result;
  }

  async createSwap(params: CreateSwapParams): Promise<CreateSwapResponse> {
    const result = await this._request((client) => client.createSwap(params));
    return result;
  }

  private async authorize(): Promise<auth.OAuth2User> {
    try {
      const clientId = process.env.ALBY_OAUTH_CLIENT_ID;
      const clientSecret = process.env.ALBY_OAUTH_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        throw new Error("OAuth client credentials missing");
      }

      const redirectURL = "https://getalby.com/extension/connect";

      const authClient = new auth.OAuth2User({
        request_options: this._getRequestOptions(),
        client_id: clientId,
        client_secret: clientSecret,
        callback: redirectURL,
        user_agent: `lightning-browser-extension:${process.env.VERSION}`,
        scopes: [
          "account:read",
          "balance:read",
          "invoices:create",
          "invoices:read",
          "payments:send",
          "transactions:read", // for outgoing invoice
        ],
        token: this.config.oAuthToken, // initialize with existing token
      });

      authClient.on("tokenRefreshed", (token: Token) => {
        this._updateOAuthToken(token);
      });
      // Currently the JS SDK guarantees request of a new refresh token is done synchronously.
      // The only way a refresh should fail is if the refresh token has expired, which is handled when the connector is initialized.
      // If a token refresh fails after init then the connector will be unusable, but we will still log errors here so that this can be debugged if it does ever happen.
      authClient.on("tokenRefreshFailed", (error: Error) => {
        console.error("Failed to Refresh token", error);
      });

      if (this.config.oAuthToken) {
        try {
          if (authClient.isAccessTokenExpired()) {
            await authClient.refreshAccessToken();
          }
          return authClient;
        } catch (error) {
          console.error("Failed to request new auth token", error);
        }
      }

      let authUrl = await authClient.generateAuthURL({
        code_challenge_method: "S256",
        authorizeUrl: process.env.ALBY_OAUTH_AUTHORIZE_URL,
      });

      authUrl += "&webln=false"; // stop getalby.com login modal launching lnurl auth

      const oAuthTab = await browser.tabs.create({ url: authUrl });

      return new Promise<auth.OAuth2User>((resolve, reject) => {
        const handleTabUpdated = (
          tabId: number,
          changeInfo: browser.Tabs.OnUpdatedChangeInfoType,
          tab: browser.Tabs.Tab
        ) => {
          if (changeInfo.status === "complete" && tabId === oAuthTab.id) {
            const authorizationCode = this.extractCodeFromTabUrl(tab.url);

            if (!authorizationCode) {
              throw new Error("no authorization code");
            }

            authClient
              .requestAccessToken(authorizationCode)
              .then((token) => {
                this._updateOAuthToken(token.token);
                resolve(authClient);
              })
              .catch((error) => {
                console.error("Failed to request new auth token", error);
                reject(error);
              })
              .finally(() => {
                browser.tabs.remove(tabId);
                browser.tabs.onUpdated.removeListener(handleTabUpdated);
              });
          }
        };
        const handleTabRemoved = (tabId: number) => {
          if (tabId === oAuthTab.id) {
            // The user closed the authentication tab without completing the flow
            const error = new Error("OAuth authentication canceled by user");
            reject(error);
            browser.tabs.onRemoved.removeListener(handleTabRemoved);
          }
        };

        browser.tabs.onUpdated.addListener(handleTabUpdated);
        browser.tabs.onRemoved.addListener(handleTabRemoved);
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private extractCodeFromTabUrl(url: string | undefined): string | null {
    if (!url) {
      return null;
    }
    const urlSearchParams = new URLSearchParams(url.split("?")[1]);
    return urlSearchParams.get("code");
  }

  private async _request<T>(func: (client: Client) => T) {
    if (!this._authUser || !this._client) {
      throw new Error("Alby client was not initialized");
    }
    let result: T;
    try {
      result = await func(this._client);
    } catch (error) {
      console.error(error);

      throw error;
    }
    return result;
  }

  private _getRequestOptions(): Partial<RequestOptions> {
    return {
      user_agent: `lightning-browser-extension:${process.env.VERSION}`,
      ...(process.env.ALBY_API_URL
        ? {
            base_url: process.env.ALBY_API_URL,
          }
        : {}),
    };
  }

  private async _updateOAuthToken(newToken: Token) {
    const access_token = newToken.access_token;
    const refresh_token = newToken.refresh_token;
    const expires_at = newToken.expires_at;

    if (access_token && refresh_token && expires_at) {
      this.config.oAuthToken = { access_token, refresh_token, expires_at };
      if (this.account.id) {
        const accounts = state.getState().accounts;
        const password = (await state.getState().password()) as string;

        const configData = decryptData(
          accounts[this.account.id].config,
          password
        );
        configData.oAuthToken = this.config.oAuthToken;
        accounts[this.account.id].config = encryptData(configData, password);
        state.setState({ accounts });
        // make sure we immediately persist the updated accounts
        await state.getState().saveToStorage();
      }
    } else {
      console.error("Invalid token");
      throw new Error("Invalid token");
    }
  }

  private async _isNodeRequired() {
    const url = `${process.env.ALBY_API_URL}/internal/users`;

    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(await this._authUser?.getAuthHeader()),
        "User-Agent": `lightning-browser-extension:${process.env.VERSION}`,
        "X-User-Agent": `lightning-browser-extension:${process.env.VERSION}`,
      },
    };

    try {
      const details = await this._genericRequest<UserDetails>(
        url,
        requestOptions
      );

      return details.node_required;
    } catch (error) {
      console.error("Error fetching limits:", error);
      throw error;
    }
  }

  private async _genericRequest<T>(
    url: RequestInfo,
    init: RequestInit
  ): Promise<T> {
    const res = await fetch(url, init);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: T = await res.json();

    return data;
  }
}
