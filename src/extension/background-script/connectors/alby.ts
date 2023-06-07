import { auth, Client } from "alby-js-sdk";
import { RequestOptions } from "alby-js-sdk/dist/request";
import { Invoice, Token } from "alby-js-sdk/dist/types";
import type { Method } from "axios";
import Base64 from "crypto-js/enc-base64";
import hmacSHA256 from "crypto-js/hmac-sha256";
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
} from "./connector.interface";

interface Config {
  login: string;
  password: string;
  url: string;
  oAuthToken: OAuthToken | undefined;
}

const HMAC_VERIFY_HEADER_KEY =
  process.env.HMAC_VERIFY_HEADER_KEY || "alby-extension"; // default is mainly that TS is happy
export default class Alby implements Connector {
  private account: Account;
  private config: Config;
  private _clientPromise: Promise<Client> | undefined;
  private _authUser: auth.OAuth2User | undefined;

  constructor(account: Account, config: Config) {
    this.account = account;
    this.config = config;
  }

  async init() {
    // not needed - client is created when the first connector method is called
    return;
  }

  getOAuthToken(): OAuthToken | undefined {
    return this.config.oAuthToken;
  }

  unload() {
    return Promise.resolve();
  }

  get supportedMethods() {
    return ["getInfo", "keysend", "makeInvoice", "sendPayment", "signMessage"];
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
    console.info("incomingInvoices", incomingInvoices);

    const invoices: ConnectorInvoice[] = incomingInvoices.map(
      (invoice, index): ConnectorInvoice => ({
        custom_records: invoice.custom_records,
        id: `${invoice.payment_request}-${index}`,
        memo: invoice.memo,
        preimage: "", // lndhub doesn't support preimage (yet)
        settled: invoice.settled,
        settleDate: new Date(invoice.settled_at).getTime(),
        totalAmount: `${invoice.amount}`,
        type: "incoming",
      })
    );
    return {
      data: {
        invoices,
      },
    };
  }

  async getInfo(): Promise<GetInfoResponse> {
    try {
      const info = await this._request((client) =>
        client.accountInformation({})
      );
      return {
        data: {
          alias: info.lightning_address,
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
    const invoice = await this._request((client) =>
      client.getInvoice(args.paymentHash)
    );
    return {
      data: {
        paid: !!invoice?.settled,
      },
    };
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    // // make sure we got the config to create a new key
    // if (!this.config.url || !this.config.login || !this.config.password) {
    //   return Promise.reject(new Error("Missing config"));
    // }
    // if (!args.message) {
    //   return Promise.reject(new Error("Invalid message"));
    // }
    // let message: string | Uint8Array;
    // message = sha256(args.message).toString(Hex);
    // let keyHex = sha256(
    //   `lndhub://${this.config.login}:${this.config.password}`
    // ).toString(Hex);
    // const { settings } = state.getState();
    // if (settings.legacyLnurlAuth) {
    //   message = utils.stringToUint8Array(args.message);
    //   keyHex = sha256(
    //     `LBE-LNDHUB-${this.config.url}-${this.config.login}-${this.config.password}`
    //   ).toString(Hex);
    // }
    // if (!keyHex) {
    //   return Promise.reject(new Error("Could not create key"));
    // }
    // const signer = new HashKeySigner(keyHex);
    // const signedMessageDERHex = signer.sign(message).toDER("hex");
    // // make sure we got some signed message
    // if (!signedMessageDERHex) {
    //   return Promise.reject(new Error("Signing failed"));
    // }
    // return Promise.resolve({
    //   data: {
    //     message: args.message,
    //     signature: signedMessageDERHex,
    //   },
    // });
    throw new Error("SignMessage is unsupported");
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
    // console.info("this.config.oAuthToken", this.config.oAuthToken);
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
        console.info("Requesting new oAuth token");
        try {
          // TODO: only do this if access token has expired
          const token = await authClient.refreshAccessToken();
          await this._updateOAuthToken(token.token);
          return authClient;
        } catch (error) {
          console.error("Failed to request new auth token", error);
        }
      }

      let authUrl = authClient.generateAuthURL({
        code_challenge_method: "S256",
      });
      // TODO: make authorize URL in alby-js-sdk customizable
      if (process.env.ALBY_OAUTH_AUTHORIZE_URL) {
        authUrl = authUrl.replace(
          "https://getalby.com/oauth",
          process.env.ALBY_OAUTH_AUTHORIZE_URL
        );
      }
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

  async getAccessToken(authResult: string, authClient: auth.OAuth2User) {
    const authToken = new URL(authResult).searchParams.get("code");
    if (!authToken) {
      throw new Error("Authentication failed: missing token");
    }

    await authClient.requestAccessToken(authToken);
  }

  generateHmacVerification(uri: string) {
    const mac = hmacSHA256(uri, HMAC_VERIFY_HEADER_KEY).toString(Base64);
    return encodeURIComponent(mac);
  }

  async request<Type>(
    method: Method,
    path: string,
    args?: Record<string, unknown>
  ): Promise<Type> {
    throw new Error(
      "Unsupported. Migrate to alby-js-sdk and remove this function"
    );
  }

  private async _getAlbyClient(): Promise<Client> {
    if (this._clientPromise) {
      return this._clientPromise;
    }

    this._clientPromise = new Promise<Client>((resolve) => {
      (async () => {
        this._authUser = await this.authorize();
        resolve(new Client(this._authUser, this._getRequestOptions()));
      })();
    });
    return this._clientPromise;
  }

  private async _request<T>(func: (client: Client) => T) {
    const client = await this._getAlbyClient();
    if (!this._authUser) {
      throw new Error("this._authUser was not created");
    }
    const oldToken = this._authUser?.token;
    let result: T;
    try {
      result = await func(client);
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
    console.info("Updating account oauth token", newToken);
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
      console.info(
        "Updated account oauth token",
        this.config.oAuthToken,
        "Account ID: " + this.account.id
      );
    } else {
      console.error("Invalid token", newToken);
      throw new Error("Invalid token");
    }
  }
}
