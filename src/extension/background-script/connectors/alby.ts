import { auth, Client } from "alby-js-sdk";
import { RequestOptions } from "alby-js-sdk/dist/request";
import {
  GetAccountInformationResponse,
  Invoice,
  Token,
} from "alby-js-sdk/dist/types";
import browser from "webextension-polyfill";
import { decryptData, encryptData } from "~/common/lib/crypto";
import { Account, OAuthToken } from "~/types";

import state from "../state";
import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
  ConnectorInvoice,
  ConnectPeerResponse,
  GetBalanceResponse,
  GetInfoResponse,
  GetInvoicesResponse,
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
    return ["getInfo", "keysend", "makeInvoice", "sendPayment", "getBalance"];
  }

  // not yet implemented
  async connectPeer(): Promise<ConnectPeerResponse> {
    console.error(
      `${this.constructor.name} does not implement the connectPeer call`
    );
    throw new Error("Not yet supported with the currently used account.");
  }

  async getInvoices(): Promise<GetInvoicesResponse> {
    const incomingInvoices = (await this._request((client) =>
      client.incomingInvoices({})
    )) as Invoice[];

    const invoices: ConnectorInvoice[] = incomingInvoices.map(
      (invoice, index): ConnectorInvoice => ({
        custom_records: invoice.custom_records,
        id: `${invoice.payment_request}-${index}`,
        memo: invoice.memo,
        preimage: "", // alby wallet api doesn't support preimage (yet)
        settled: invoice.settled,
        settleDate: new Date(invoice.settled_at).getTime(),
        totalAmount: `${invoice.amount}`,
        type: "received",
      })
    );
    return {
      data: {
        invoices,
      },
    };
  }

  async getInfo(): Promise<
    GetInfoResponse<WebLNNode & GetAccountInformationResponse>
  > {
    try {
      const info = await this._request((client) =>
        client.accountInformation({})
      );
      return {
        data: {
          ...info,
          alias: "🐝 getalby.com",
        },
      };
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
      "SignMessage is not supported by Alby accounts. Generate a secret key to use LNURL auth."
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

  private async authorize(): Promise<auth.OAuth2User> {
    try {
      const clientId = process.env.ALBY_OAUTH_CLIENT_ID;
      const clientSecret = process.env.ALBY_OAUTH_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        throw new Error("OAuth client credentials missing");
      }

      const redirectURL = browser.identity.getRedirectURL();
      const authClient = new auth.OAuth2User({
        request_options: this._getRequestOptions(),
        client_id: clientId,
        client_secret: clientSecret,
        callback: redirectURL,
        user_agent: `lightning-browser-extension:${process.env.VERSION}`,
        scopes: [
          "invoices:read",
          "account:read",
          "balance:read",
          "invoices:create",
          "invoices:read",
          "payments:send",
          "transactions:read", // for outgoing invoice
        ],
        token: this.config.oAuthToken, // initialize with existing token
      });

      if (this.config.oAuthToken) {
        try {
          if (authClient.isAccessTokenExpired()) {
            const token = await authClient.refreshAccessToken();
            await this._updateOAuthToken(token.token);
          }
          return authClient;
        } catch (error) {
          // if auth token refresh fails, the refresh token has probably expired or is invalid
          // the user will be asked to re-login
          console.error("Failed to request new auth token", error);
        }
      }

      let authUrl = authClient.generateAuthURL({
        code_challenge_method: "S256",
        authorizeUrl: process.env.ALBY_OAUTH_AUTHORIZE_URL,
      });

      authUrl += "&webln=false"; // stop getalby.com login modal launching lnurl auth
      const authResult = await this.launchWebAuthFlow(authUrl);
      const code = new URL(authResult).searchParams.get("code");
      if (!code) {
        throw new Error("Authentication failed: missing authResult");
      }

      const token = await authClient.requestAccessToken(code);
      await this._updateOAuthToken(token.token);
      return authClient;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async launchWebAuthFlow(authUrl: string) {
    const authResult = await browser.identity.launchWebAuthFlow({
      interactive: true,
      url: authUrl,
    });

    return authResult;
  }

  private async _request<T>(func: (client: Client) => T) {
    if (!this._authUser || !this._client) {
      throw new Error("Alby client was not initialized");
    }
    const oldToken = this._authUser?.token;
    let result: T;
    try {
      result = await func(this._client);
    } catch (error) {
      console.error(error);

      throw error;
    } finally {
      const newToken = this._authUser.token;
      if (newToken && newToken !== oldToken) {
        await this._updateOAuthToken(newToken);
      }
    }
    return result;
  }

  private _getRequestOptions(): Partial<RequestOptions> {
    return {
      ...(process.env.ALBY_API_URL
        ? { base_url: process.env.ALBY_API_URL }
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
}
