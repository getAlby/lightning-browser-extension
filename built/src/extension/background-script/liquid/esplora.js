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
exports.fetchAssetRegistry = exports.Esplora = void 0;
const axios_1 = __importDefault(require("axios"));
const liquidjs_lib_1 = require("liquidjs-lib");
class Esplora {
    constructor(baseURL) {
        this.httpClient = axios_1.default.create({
            baseURL,
            adapter: "fetch",
        });
    }
    static fromNetwork(network) {
        switch (network) {
            case "liquid":
                return new Esplora("https://blockstream.info/liquid/api");
            case "testnet":
                return new Esplora("https://blockstream.info/liquidtestnet/api");
            default:
                throw new Error(`Unsupported network: ${network}`);
        }
    }
    getAsset(assetHash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (LBTC_ASSET_HASHES.includes(assetHash))
                return makeLBTC(assetHash);
            const response = yield this.httpClient.get(`/asset/${assetHash}`);
            if (!isRawGetAssetResponse(response.data))
                throw new Error("Invalid response");
            return toAssetInfos(response.data);
        });
    }
}
exports.Esplora = Esplora;
function isRawGetAssetResponse(obj) {
    return (typeof obj === "object" &&
        obj !== null &&
        "asset_id" in obj &&
        typeof obj.asset_id === "string" &&
        "ticker" in obj &&
        typeof obj.ticker === "string" &&
        "name" in obj &&
        typeof obj.name === "string" &&
        "precision" in obj &&
        typeof obj.precision === "number");
}
function toAssetInfos(raw) {
    return {
        assetHash: raw.asset_id,
        ticker: raw.ticker,
        name: raw.name,
        precision: raw.precision,
    };
}
const LBTC_ASSET_HASHES = [
    liquidjs_lib_1.networks.liquid.assetHash,
    liquidjs_lib_1.networks.testnet.assetHash,
    liquidjs_lib_1.networks.regtest.assetHash,
];
const makeLBTC = (assetHash) => ({
    assetHash,
    ticker: "LBTC",
    name: "Liquid Bitcoin",
    precision: 8,
});
// fetchAssetRegistry will try to fetch all assets info in the pset preview
function fetchAssetRegistry(esplora, preview, onError) {
    return __awaiter(this, void 0, void 0, function* () {
        const assets = new Set();
        for (const input of preview.inputs) {
            assets.add(input.asset);
        }
        for (const output of preview.outputs) {
            assets.add(output.asset);
        }
        const assetRegistry = {};
        const results = yield Promise.allSettled(Array.from(assets).map((asset) => esplora.getAsset(asset)));
        for (const result of results) {
            if (result.status === "fulfilled") {
                assetRegistry[result.value.assetHash] = result.value;
                continue;
            }
            if (result.status === "rejected") {
                onError(result.reason);
            }
        }
        return assetRegistry;
    });
}
exports.fetchAssetRegistry = fetchAssetRegistry;
