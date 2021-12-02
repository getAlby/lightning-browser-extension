import Base from "../base";

import wasm from "./lnconnect-wasm";

class LnTerminalConnect extends Base {
  constructor(config) {
    super(config);
  }

  async init() {
    this.connection = wasm.init();
    return this.connection.connectServer(this.config.server, true, this.config.password);
  }

  getInfo() {
    return new Promise((resolve, reject) => {
      this.connection.invokeRPC(
        "lnrpc.Lightning.GetInfo",
        "{}",
        (response) => {
          const info = JSON.parse(response);
          resolve({
            data: {
              alias: info.alias,
              pubkey: info.identity_pubkey,
              color: info.color,
            },
          }
        );
      });
    });
  }

  getBalance() {
    return new Promise((resolve, reject) => {
      this.connection.invokeRPC(
        "lnrpc.Lightning.ChannelBalance",
        "{}",
        (response) => {
          console.log({response});
          const data = JSON.parse(response);

          resolve({
            data: {
              balance: data.balance,
              pending_open_balance: data.pending_open_balance,
            },
          });
        }
      );
    });
  }

  sendPayment(args) {
    return this.invokeRPC(
      "routerrpc.Router.SendPaymentV2",
      JSON.stringify({ payment_request: args.paymentRequest })
    ).then((response) => {
      console.log(response);
      return response;
    });
  }

  invokeRPC(method, request) {
    return new Promise((resolve, reject) => {
      this.connection.invokeRPC(method, request, (response) => {
        // TODO: how to do error handling?
        resolve(response);
      })
    });
  }
}

export default LnTerminalConnect;
