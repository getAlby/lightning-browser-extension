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
const getAddress_1 = __importDefault(require("~/extension/background-script/actions/webbtc/getAddress"));
const bitcoin_1 = __importDefault(require("~/extension/background-script/bitcoin"));
const mnemonic_1 = __importDefault(require("~/extension/background-script/mnemonic"));
const state_1 = __importDefault(require("~/extension/background-script/state"));
const btc_1 = require("~/fixtures/btc");
const passwordMock = jest.fn;
const mockState = {
    password: passwordMock,
    currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
    getAccount: () => ({
        mnemonic: btc_1.btcFixture.mnemonic,
        bitcoinNetwork: "regtest",
    }),
    getMnemonic: () => new mnemonic_1.default(btc_1.btcFixture.mnemonic),
    getBitcoin: () => new bitcoin_1.default(new mnemonic_1.default(btc_1.btcFixture.mnemonic), "regtest"),
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
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    // fill the DB first
}));
afterEach(() => {
    jest.clearAllMocks();
});
function sendGetAddressMessage() {
    return __awaiter(this, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "getAddress",
            origin: {
                internal: true,
            },
            args: {},
        };
        return yield (0, getAddress_1.default)(message);
    });
}
describe("getAddress", () => {
    test("get taproot address", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield sendGetAddressMessage();
        if (!result.data) {
            throw new Error("Result should have data");
        }
        expect(result.data).toMatchObject({
            publicKey: "0255355ca83c973f1d97ce0e3843c85d78905af16b4dc531bc488e57212d230116",
            derivationPath: "m/86'/1'/0'/0/0",
            index: 0,
            address: "bcrt1p8wpt9v4frpf3tkn0srd97pksgsxc5hs52lafxwru9kgeephvs7rqjeprhg",
        });
    }));
});
