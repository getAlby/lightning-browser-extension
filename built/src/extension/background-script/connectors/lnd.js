"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enc_base64_1 = __importDefault(require("crypto-js/enc-base64"));
const enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
const enc_utf8_1 = __importDefault(require("crypto-js/enc-utf8"));
const lib_typedarrays_1 = __importDefault(require("crypto-js/lib-typedarrays"));
const sha256_1 = __importDefault(require("crypto-js/sha256"));
const utils_1 = __importDefault(require("~/common/lib/utils"));
const helpers_1 = require("~/common/utils/helpers");
const paymentRequest_1 = require("~/common/utils/paymentRequest");
const connector_interface_1 = require("./connector.interface");
const methods = {
    getinfo: {
        path: "/v1/getinfo",
        httpMethod: "GET",
    },
    listchannels: {
        path: "/v1/channels",
        httpMethod: "GET",
    },
    listinvoices: {
        path: "/v1/invoices",
        httpMethod: "GET",
    },
    channelbalance: {
        path: "/v1/balance/channels",
        httpMethod: "GET",
    },
    walletbalance: {
        path: "/v1/balance/blockchain",
        httpMethod: "GET",
    },
    openchannel: {
        path: "/v1/channels",
        httpMethod: "POST",
    },
    connectpeer: {
        path: "/v1/peers",
        httpMethod: "POST",
    },
    disconnectpeer: {
        path: "/v1/peers/{{pub_key}}",
        httpMethod: "DELETE",
    },
    estimatefee: {
        path: "/v1/transactions/fee",
        httpMethod: "GET",
    },
    getchaninfo: {
        path: "/v1/graph/edge/{{chan_id}}",
        httpMethod: "GET",
    },
    getnetworkinfo: {
        path: "/v1/graph/info",
        httpMethod: "GET",
    },
    getnodeinfo: {
        path: "/v1/graph/node/{{pub_key}}",
        httpMethod: "GET",
    },
    gettransactions: {
        path: "/v1/transactions",
        httpMethod: "GET",
    },
    listpayments: {
        path: "/v1/payments",
        httpMethod: "GET",
    },
    listpeers: {
        path: "/v1/peers",
        httpMethod: "GET",
    },
    lookupinvoice: {
        path: "/v1/invoice/{{r_hash_str}}",
        httpMethod: "GET",
    },
    queryroutes: {
        path: "/v1/graph/routes/{{pub_key}}/{{amt}}",
        httpMethod: "GET",
    },
    verifymessage: {
        path: "/v1/verifymessage",
        httpMethod: "POST",
    },
    sendtoroute: {
        path: "/v1/channels/transactions/route",
        httpMethod: "POST",
    },
    decodepayreq: {
        path: "/v1/payreq/{{pay_req}}",
        httpMethod: "GET",
    },
    routermc: {
        path: "/v2/router/mc",
        httpMethod: "GET",
    },
    addinvoice: {
        path: "/v1/invoices",
        httpMethod: "POST",
    },
    addholdinvoice: {
        path: "/v2/invoices/hodl",
        httpMethod: "POST",
    },
    settleinvoice: {
        path: "/v2/invoices/settle",
        httpMethod: "POST",
    },
    newaddress: {
        path: "/v1/newaddress",
        httpMethod: "GET",
    },
    nextaddr: {
        path: "/v2/wallet/address/next",
        httpMethod: "POST",
    },
    listaddresses: {
        path: "/v2/wallet/addresses",
        httpMethod: "GET",
    },
    listunspent: {
        path: "/v2/wallet/utxos",
        httpMethod: "POST",
    },
};
const pathTemplateParser = (template, data) => {
    return template.replace(/{{(.*?)}}/g, (match) => {
        const key = match.split(/{{|}}/).filter(Boolean)[0];
        const value = data[key];
        if (value === undefined) {
            throw new Error(`Missing parameter ${key}`);
        }
        delete data[key];
        return String(value); // typecast to string
    });
};
class Lnd {
    constructor(account, config) {
        this.getBlockchainBalance = () => {
            return this.request("GET", "/v1/balance/blockchain", undefined, {
                unconfirmed_balance: "0",
                confirmed_balance: "0",
                total_balance: "0",
            });
        };
        this.getChannelsBalance = () => {
            return this.request("GET", "/v1/balance/channels", undefined, {
                balance: 0,
            }).then((data) => {
                return {
                    data: {
                        balance: +data.balance,
                    },
                };
            });
        };
        this.account = account;
        this.config = config;
    }
    init() {
        return Promise.resolve();
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
            "signMessage",
            "getBalance",
            ...(0, connector_interface_1.flattenRequestMethods)(Object.keys(methods)),
        ];
    }
    requestMethod(method, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const methodDetails = methods[method];
            if (!methodDetails) {
                throw new Error(`${method} is not supported`);
            }
            const httpMethod = methodDetails.httpMethod;
            let path = methodDetails.path;
            // add path parameters from the args hash and remove those attributes from args
            // e.g. pathTemplateParser('invoice/{{r_hash_str}}', {r_hash_str: 'foo'})
            //   will return invoice/foo and delete r_hash_str from the args object;
            path = pathTemplateParser(path, args);
            const response = yield this.request(httpMethod, path, args);
            return {
                data: response,
            };
        });
    }
    getInfo() {
        return this.request("GET", "/v1/getinfo", undefined, {}).then((data) => {
            return {
                data: {
                    alias: data.alias,
                    pubkey: data.identity_pubkey,
                    color: data.color,
                },
            };
        });
    }
    getBalance() {
        return this.getChannelsBalance();
    }
    connectPeer(args) {
        const { pubkey, host } = args;
        return this.request("POST", "/v1/peers", {
            addr: {
                pubkey,
                host,
            },
            perm: true,
        })
            .then((data) => {
            return {
                data: true,
            };
        })
            .catch((e) => {
            // the request fails (HTTP 500), but if we are already connected we say it's a success
            if (e.message.match(/already connected/)) {
                return {
                    data: true,
                };
            }
            else {
                throw new Error(e.message);
            }
        });
    }
    sendPayment(args) {
        return this.request("POST", "/v1/channels/transactions", {
            payment_request: args.paymentRequest,
        }, {}).then((data) => {
            if (data.payment_error) {
                throw new Error(data.payment_error);
            }
            const { total_amt, total_fees } = data.payment_route;
            return {
                data: {
                    preimage: utils_1.default.base64ToHex(data.payment_preimage),
                    paymentHash: utils_1.default.base64ToHex(data.payment_hash),
                    route: { total_amt: total_amt - total_fees, total_fees },
                },
            };
        });
    }
    keysend(args) {
        return __awaiter(this, void 0, void 0, function* () {
            // See: https://gist.github.com/dellagustin/c3793308b75b6b0faf134e64db7dc915
            const dest_pubkey_hex = args.pubkey;
            const dest_pubkey_base64 = enc_hex_1.default.parse(dest_pubkey_hex).toString(enc_base64_1.default);
            const preimage = lib_typedarrays_1.default.random(32);
            const preimage_base64 = preimage.toString(enc_base64_1.default);
            const hash = (0, sha256_1.default)(preimage).toString(enc_base64_1.default);
            //base64 encode the record values
            const records_base64 = {};
            for (const key in args.customRecords) {
                records_base64[key] = enc_utf8_1.default.parse(args.customRecords[key]).toString(enc_base64_1.default);
            }
            //mandatory record for keysend
            records_base64["5482373484"] = preimage_base64;
            return this.request("POST", "/v1/channels/transactions", {
                dest: dest_pubkey_base64,
                amt: args.amount,
                payment_hash: hash,
                dest_custom_records: records_base64,
            }, {}).then((data) => {
                if (data.payment_error) {
                    throw new Error(data.payment_error);
                }
                return {
                    data: {
                        preimage: utils_1.default.base64ToHex(data.payment_preimage),
                        paymentHash: utils_1.default.base64ToHex(data.payment_hash),
                        route: data.payment_route,
                    },
                };
            });
        });
    }
    checkPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.request("GET", `/v1/invoice/${args.paymentHash}`);
            return {
                data: {
                    paid: data.settled,
                },
            };
        });
    }
    signMessage(args) {
        // use v2 to use the key locator (key_loc)
        // return this.request("POST", "/v2/signer/signmessage", {
        return this.request("POST", "/v1/signmessage", {
            msg: enc_base64_1.default.stringify(enc_utf8_1.default.parse(args.message)),
        }).then((data) => {
            return {
                data: {
                    message: args.message,
                    signature: data.signature,
                },
            };
        });
    }
    makeInvoice(args) {
        return this.request("POST", "/v1/invoices", {
            memo: args.memo,
            value: args.amount,
        }).then((data) => {
            return {
                data: {
                    paymentRequest: data.payment_request,
                    rHash: utils_1.default.base64ToHex(data.r_hash),
                },
            };
        });
    }
    getAddress() {
        return this.request("POST", "/v2/wallet/address/next", undefined, {});
    }
    getInvoices() {
        return __awaiter(this, void 0, void 0, function* () {
            const lndInvoices = yield this.request("GET", "/v1/invoices", { reversed: true });
            const invoices = lndInvoices.invoices.map((invoice, index) => {
                const custom_records = invoice.htlcs[0] && invoice.htlcs[0].custom_records;
                return {
                    id: `${invoice.payment_request}-${index}`,
                    memo: invoice.memo,
                    preimage: utils_1.default.base64ToHex(invoice.r_preimage),
                    payment_hash: utils_1.default.base64ToHex(invoice.r_hash),
                    settled: invoice.settled,
                    settleDate: parseInt(invoice.settle_date) * 1000,
                    creationDate: parseInt(invoice.creation_date) * 1000,
                    totalAmount: parseInt(invoice.value),
                    type: "received",
                    custom_records,
                };
            });
            return invoices;
        });
    }
    getTransactions() {
        return __awaiter(this, void 0, void 0, function* () {
            const invoices = yield this.getInvoices();
            const payments = yield this.getPayments();
            const transactions = (0, helpers_1.mergeTransactions)(invoices, payments).filter((transaction) => transaction.settled);
            return {
                data: {
                    transactions,
                },
            };
        });
    }
    getPayments() {
        return __awaiter(this, void 0, void 0, function* () {
            const lndPayments = yield this.request("GET", "/v1/payments", {
                reversed: true,
                max_payments: 100,
                include_incomplete: false,
            });
            const payments = lndPayments.payments.map((payment, index) => {
                let description;
                if (payment.payment_request) {
                    description = (0, paymentRequest_1.getPaymentRequestDescription)(payment.payment_request);
                }
                return {
                    id: `${payment.payment_request}-${index++}`,
                    memo: description,
                    preimage: payment.payment_preimage,
                    payment_hash: payment.payment_hash,
                    settled: true,
                    settleDate: parseInt(payment.creation_date) * 1000,
                    creationDate: parseInt(payment.creation_date) * 1000,
                    totalAmount: payment.value_sat,
                    type: "sent",
                };
            });
            return payments;
        });
    }
    request(method, path, args, defaultValues) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = new URL(this.config.url);
            url.pathname = `${url.pathname.replace(/\/$/, "")}${path}`;
            let body = null;
            const headers = new Headers();
            headers.append("Accept", "application/json");
            if (method === "POST") {
                body = JSON.stringify(args);
                headers.append("Content-Type", "application/json");
            }
            else if (args !== undefined) {
                url.search = new URLSearchParams(args).toString();
            }
            if (this.config.macaroon) {
                headers.append("Grpc-Metadata-macaroon", this.config.macaroon);
            }
            const res = yield fetch(url.toString(), {
                method,
                headers,
                body,
            });
            if (!res.ok) {
                // TODO: this needs refactoring! we also should switch to using axios here
                let errBody;
                try {
                    errBody = yield res.json();
                    // Breaking change in v0.14.1, res.error became res.message. Simply
                    // map it over for now.
                    if (errBody.message && !errBody.error) {
                        errBody.error = errBody.message;
                        delete errBody.message;
                    }
                    if (!errBody.error) {
                        throw new Error("Something went wrong");
                    }
                }
                catch (err) {
                    throw new Error(res.statusText);
                }
                console.error(errBody);
                throw new Error(errBody.error);
            }
            let data = yield res.json();
            if (defaultValues) {
                data = Object.assign(Object.assign({}, defaultValues), data);
            }
            return data;
        });
    }
}
exports.default = Lnd;
