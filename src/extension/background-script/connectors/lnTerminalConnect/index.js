import Base from "../base";

import wasm from "./lnconnect-wasm";

class LnTerminalConnect extends Base {
  constructor(config) {
    super(config);
    this.connection = wasm.init(); // TODO: move to async init() function; how to disconnect?
    this.connection.connectServer(this.config.server, true, this.config.password);
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
}

export default LnTerminalConnect;
