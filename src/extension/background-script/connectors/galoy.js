import axios from "axios";
import sha256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";
import { parsePaymentRequest } from "invoices";
import Base from "./base";
import utils from "../../../common/lib/utils";
import HashKeySigner from "../../../common/utils/signer";

export default class Galoy extends Base {
  getInfo() {
    const query = {
      query: `
        query getinfo {
          me {
              id
              username
              defaultAccount {
                wallets {
                  id
              }
            }
          }
        }
      `,
    };
    return this.request("POST", "", query, {}).then((data) => {
      return {
        data: {
          alias: data.data.me.username,
        },
      };
    });
  }

  getBalance() {
    const query = {
      query: `
        query getinfo {
          me {
              id
              username
              defaultAccount {
                wallets {
                  balance
              }
            }
          }
        }
      `,
    };
    return this.request("POST", "", query, {}).then((data) => {
      return {
        data: {
          balance: data.data.me.defaultAccount.wallets[0].balance,
        },
      };
    });
  }

  sendPayment(args) {
    const query = {
      query: `
        query getinfo {
          me {
              id
              username
              defaultAccount {
                wallets {
                  balance
              }
            }
          }
        }
      `,
    };
    return this.request("POST", "/payinvoice", {
      invoice: args.paymentRequest,
    }).then((data) => {
      if (data.error) {
        return { error: data.message };
      }
      if (data.payment_error) {
        return { error: data.payment_error };
      }
      if (
        typeof data.payment_hash === "object" &&
        data.payment_hash.type === "Buffer"
      ) {
        data.payment_hash = Buffer.from(data.payment_hash.data).toString("hex");
      }
      if (
        typeof data.payment_preimage === "object" &&
        data.payment_preimage.type === "Buffer"
      ) {
        data.payment_preimage = Buffer.from(
          data.payment_preimage.data
        ).toString("hex");
      }

      // HACK!
      // some Lnbits extension that implement the LNDHub API do not return the route information.
      // to somewhat work around this we set a payment route and use the amount from the payment request.
      // lnbits needs to fix this and return proper route information with a total amount and fees
      if (!data.payment_route) {
        const paymentRequestDetails = parsePaymentRequest({
          request: args.paymentRequest,
        });
        const amountInSats = parseInt(paymentRequestDetails.tokens);
        data.payment_route = { total_amt: amountInSats, total_fees: 0 };
      }
      return {
        data: {
          preimage: data.payment_preimage,
          paymentHash: data.payment_hash,
          route: data.payment_route,
        },
      };
    });
  }

  signMessage(args) {
    // make sure we got the config to create a new key
    if (!this.config.url || !this.config.login || !this.config.password) {
      return Promise.reject(new Error("Missing config"));
    }
    if (!args.message) {
      return Promise.reject(new Error("Invalid message"));
    }
    const message = utils.stringToUint8Array(args.message);
    // create a signing key from the lndhub URL and the login/password combination
    const keyHex = sha256(
      `LBE-LNDHUB-${this.config.url}-${this.config.login}-${this.config.password}`
    ).toString(Hex);
    if (!keyHex) {
      return Promise.reject(new Error("Could not create key"));
    }
    const signer = new HashKeySigner(keyHex);
    const signedMessageDERHex = signer.sign(message).toDER("hex");
    // make sure we got some signed message
    if (!signedMessageDERHex) {
      return Promise.reject(new Error("Signing failed"));
    }
    return Promise.resolve({
      data: {
        signature: signedMessageDERHex,
      },
    });
  }

  verifyMessage(args) {
    // create a signing key from the lndhub URL and the login/password combination
    const keyHex = sha256(
      `LBE-LNDHUB-${this.config.url}-${this.config.login}-${this.config.password}`
    ).toString(Hex);
    if (!keyHex) {
      return Promise.reject(new Error("Could not create key"));
    }
    const signer = new HashKeySigner(keyHex);
    return Promise.resolve({
      data: {
        valid: signer.verify(args.message, args.signature),
      },
    });
  }

  makeInvoice(args) {
    const query = {
      query: `
        mutation lnInvoiceCreate($input: LnInvoiceCreateInput!) {
          lnInvoiceCreate(input: $input) {
            invoice {
              paymentRequest
              paymentHash
              paymentSecret
              satoshis
            }
            errors {
              message
            }
          }
        }
            `,
      variables: {
        input: {
          amount: args.amount,
          memo: args.memo,
        },
      },
    };
    return this.request("POST", "", query, {}).then((data) => {
      return {
        data: {
          paymentRequest: data.data.lnInvoiceCreate.invoice.paymentRequest,
          rHash: data.data.lnInvoiceCreate.invoice.paymentHash,
        },
      };
    });
  }

  async request(method, path, args, defaultValues) {
    if (!this.accessToken) {
      this.accessToken = this.config.accessToken;
    }

    const reqConfig = {
      method: method,
      url: this.config.url + path,
      responseType: "json",
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
    };
    if (method === "POST") {
      reqConfig.data = args;
    } else if (args !== undefined) {
      reqConfig.params = args;
    }
    let data;
    try {
      const res = await axios(reqConfig);
      data = res.data;
    } catch (e) {
      console.log(e);
      throw new Error(e.message);
    }
    // if (data && data.error) {
    //   if (data.code * 1 === 1 && !this.noRetry) {
    //     try {
    //       await this.authorize();
    //     } catch (e) {
    //       console.log(e);
    //       throw new Error(e.message);
    //     }
    //     this.noRetry = true;
    //     return this.request(method, path, args, defaultValues);
    //   } else {
    //     throw new Error(data.message);
    //   }
    // }
    // if (defaultValues) {
    //   data = Object.assign(Object.assign({}, defaultValues), data);
    // }
    return data;
  }
}
