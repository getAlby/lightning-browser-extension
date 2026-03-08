"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const liquid_1 = __importDefault(require("~/extension/providers/liquid"));
const nostr_1 = __importDefault(require("~/extension/providers/nostr"));
const providerBase_1 = __importDefault(require("~/extension/providers/providerBase"));
const webbtc_1 = __importDefault(require("~/extension/providers/webbtc"));
const webln_1 = __importDefault(require("~/extension/providers/webln"));
class AlbyProvider extends providerBase_1.default {
    constructor() {
        super("alby");
        this.webln = new webln_1.default();
        this.nostr = new nostr_1.default();
        this.webbtc = new webbtc_1.default();
        this.liquid = new liquid_1.default();
    }
    /**
     * Adds a wallet to the user's Alby extension
     *
     * @param name The name of the account
     * @param connector The connector to use
     * @param config The config to pass to the connector
     * @returns Nothing, throws if user rejects
     */
    addAccount(params) {
        this._checkEnabled("addAccount");
        return this.execute("addAccount", {
            name: params.name,
            connector: params.connector,
            config: params.config,
        });
    }
}
exports.default = AlbyProvider;
