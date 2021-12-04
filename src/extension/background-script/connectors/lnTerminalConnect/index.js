import Base from "../base";

import wasm from "./lnconnect-wasm";

class LnTerminalConnect extends Base {
  constructor(config) {
    super(config);
  }

  init() {
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

  async unload() {
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

  getInfo() {
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

  getBalance() {
    return this.invokeRPC("lnrpc.Lightning.ChannelBalance", {}).then((response) => {
      return {
        data: {
          balance: response.balance,
          pending_open_balance: response.pending_open_balance,
        },
      };
    });
  }

  sendPayment(args) {
    return this.invokeRPC(
      "lnrpc.Lightning.SendPaymentSync",
      { payment_request: args.paymentRequest }
    ).then((response) => {
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

  makeInvoice(args) {
    return this.invokeRPC("lnrpc.Lightning.AddInvoice", { memo: args.memo, value: args.amount }).then((response) => {
      return {
        data: {
          paymentRequest: response.payment_request,
          rHash: response.r_hash,
        },
      };
    });
  }

  signMessage(args) {
    return this.invokeRPC("lnrpc.Lightning.SignMessage", { msg: args.message }).then((response) => {
      return {
        data: {
          message: args.message,
          signature: response.signature,
        },
      };
    });
  }

  verifyMessage(args) {
    return this.invokeRPC("lnrpc.Lightning.VerifyMessage", { msg: args.message, signature: args.signature }).then((response) => {
      return {
        data: {
          valid: response.valid,
        },
      };
    });
  }

  invokeRPC(method, request) {
    return new Promise((resolve, reject) => {
      this.connection.invokeRPC(method, JSON.stringify(request), (response, error) => {
        if (response) {
          resolve(JSON.parse(response));
        } else {
          console.log("invokeRPC", {arguments});
          // TODO: how to do error handling?
          error(response);
        }
      });
    });
  }
}

export default LnTerminalConnect;
