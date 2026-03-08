"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const secp256k1_1 = require("@noble/secp256k1");
const liquidjs_lib_1 = require("liquidjs-lib");
const getAddressOrPrompt_1 = __importDefault(require("~/extension/background-script/actions/liquid/getAddressOrPrompt"));
const liquid_1 = __importDefault(require("~/extension/background-script/liquid"));
const ecc = __importStar(require("~/extension/background-script/liquid/secp256k1"));
const mnemonic_1 = __importDefault(require("~/extension/background-script/mnemonic"));
const state_1 = __importDefault(require("~/extension/background-script/state"));
const liquid_2 = require("~/fixtures/liquid");
const passwordMock = jest.fn;
const mockState = {
    password: passwordMock,
    currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
    getAccount: () => ({
        mnemonic: liquid_2.liquidFixtureSign.mnemonic,
        bitcoinNetwork: "testnet",
    }),
    getMnemonic: () => new mnemonic_1.default(liquid_2.liquidFixtureSign.mnemonic),
    getLiquid: () => Promise.resolve(new liquid_1.default(new mnemonic_1.default(liquid_2.liquidFixtureSign.mnemonic), "testnet")),
    getConnector: jest.fn(),
};
state_1.default.getState = jest.fn().mockReturnValue(mockState);
jest.mock("~/common/lib/crypto", () => {
    return {
        decryptData: jest.fn((encrypted, _password) => {
            return encrypted;
        }),
    };
});
jest.mock("~/extension/background-script/permissions", () => {
    return {
        hasPermissionFor: jest.fn(() => true),
    };
});
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    // fill the DB first
}));
afterEach(() => {
    jest.clearAllMocks();
});
function sendGetAddressMessage() {
    const message = {
        application: "LBE",
        prompt: true,
        action: "getLiquidAddress",
        origin: {
            description: "localhost test",
            domain: "vulpem.com",
            external: true,
            icon: "",
            location: "https://localhost:3000",
            pathname: "/",
            name: "localhost",
            metaData: {},
            host: "localhost",
        },
    };
    return (0, getAddressOrPrompt_1.default)(message);
}
describe("getLiquidAddress", () => {
    test("get taproot address", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield sendGetAddressMessage();
        if (!(result === null || result === void 0 ? void 0 : result.data)) {
            throw new Error("Result should have data");
        }
        expect(result.data).toMatchObject({
            publicKey: "02e7ab2537b5d49e970309aae06e9e49f36ce1c9febbd44ec8e0d1cca0b4f9c319",
            address: "tlq1pqdgv4nzmzd40ujex8e0770f2qtmg9fss3tp0ue7grd75m3q4w0t9t8frsft7dg85m62mhvzprgf3u67sr75jhun4qe0uf55rwfndd83609xfpguyml07",
            blindingPrivateKey: "236ff8d94b6f7973108b5ab73c9be0f6b45272effda82fdb32585d33217e1f12",
        });
        const { blindingKey, unconfidentialAddress } = liquidjs_lib_1.address.fromConfidential(result.data.address);
        const publicBlindKeyFromPrvKey = (0, secp256k1_1.getPublicKey)(result.data.blindingPrivateKey, true);
        // blind key in address should be associated with the private blinding key
        expect(blindingKey.toString("hex")).toBe(Buffer.from(publicBlindKeyFromPrvKey).toString("hex"));
        // scriptPubKey should be a taproot key-path using publicKey as internal key
        const scriptPubKey = liquidjs_lib_1.bip341
            .BIP341Factory(ecc)
            .taprootOutputScript(Buffer.from(secp256k1_1.etc.hexToBytes(result.data.publicKey)));
        expect(scriptPubKey.toString("hex")).toBe(liquidjs_lib_1.address.toOutputScript(unconfidentialAddress).toString("hex"));
    }));
});
