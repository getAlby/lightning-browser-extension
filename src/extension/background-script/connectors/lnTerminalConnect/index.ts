import Base from "../base";
import Connector, {
  SendPaymentArgs,
  SendPaymentResponse,
  GetInfoResponse,
  GetBalanceResponse,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
  SignMessageArgs,
  SignMessageResponse,
  VerifyMessageArgs,
  VerifyMessageResponse,
} from "../connector.interface";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: implicitly has 'any' type error
import wasm from "./lnconnect-wasm.js";

interface Config {
  password: string;
  server: string;
}

class LnTerminalConnect extends Base implements Connector {
  connection: any; //
  constructor(config: Config) {
    super(config);
  }

  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection = wasm.init();
      this.connection.connectServer(
        this.config.server,
        false,
        this.config.password
      );
      // we have to wait a bit until the connection is ready
      setTimeout(() => {
        resolve();
      }, 300);
    });
  }

  async unload(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connection) {
        this.connection.disconnect();
        // we have to wait a bit until the connection is closed
        setTimeout(() => {
          this.connection = null;
          resolve();
        }, 300);
      } else {
        resolve();
      }
    });
  }

  getInfo(): Promise<GetInfoResponse> {
    return this.invokeRPC("lnrpc.Lightning.GetInfo", {}).then((response) => {
      return {
        data: {
          alias: response.alias,
          pubkey: response.identity_pubkey,
          color: response.color,
        },
      };
    });
  }

  getBalance(): Promise<GetBalanceResponse> {
    return this.invokeRPC("lnrpc.Lightning.ChannelBalance", {}).then(
      (response) => {
        return {
          data: {
            balance: response.balance,
            pending_open_balance: response.pending_open_balance,
          },
        };
      }
    );
  }

  sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    return this.invokeRPC("lnrpc.Lightning.SendPaymentSync", {
      payment_request: args.paymentRequest,
    }).then((response) => {
      return {
        data: {
          preimage: response.payment_preimage,
          paymentHash: response.payment_hash,
          route: {
            total_amt: response.payment_route.total_amt,
            total_fees: response.payment_route.total_fees,
          },
        },
      };
    });
  }

  makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    return this.invokeRPC("lnrpc.Lightning.AddInvoice", {
      memo: args.memo,
      value: args.amount,
    }).then((response) => {
      return {
        data: {
          paymentRequest: response.payment_request,
          rHash: response.r_hash,
        },
      };
    });
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    return this.invokeRPC("lnrpc.Lightning.SignMessage", {
      msg: args.message,
    }).then((response) => {
      return {
        data: {
          message: args.message,
          signature: response.signature,
        },
      };
    });
  }

  verifyMessage(args: VerifyMessageArgs): Promise<VerifyMessageResponse> {
    return this.invokeRPC("lnrpc.Lightning.VerifyMessage", {
      msg: args.message,
      signature: args.signature,
    }).then((response) => {
      return {
        data: {
          valid: response.valid,
        },
      };
    });
  }

  invokeRPC(method: string, request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.connection.invokeRPC(
        method,
        JSON.stringify(request),
        (response: string, error: any) => {
          if (response) {
            resolve(JSON.parse(response));
          } else {
            console.log("invokeRPC", { response, error });
            // TODO: how to do error handling?
            error(response);
          }
        }
      );
    });
  }
}

export default LnTerminalConnect;
