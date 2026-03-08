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
const getPsbtPreview_1 = __importDefault(require("~/extension/background-script/actions/webbtc/getPsbtPreview"));
const signPsbt_1 = __importDefault(require("~/extension/background-script/actions/webbtc/signPsbt"));
const bitcoin_1 = __importDefault(require("~/extension/background-script/bitcoin"));
const mnemonic_1 = __importDefault(require("~/extension/background-script/mnemonic"));
const state_1 = __importDefault(require("~/extension/background-script/state"));
const btc_1 = require("~/fixtures/btc");
const passwordMock = jest.fn;
function mockSettings(network) {
    const mockState = {
        password: passwordMock,
        currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
        getAccount: () => ({
            mnemonic: btc_1.btcFixture.mnemonic,
            bitcoinNetwork: network,
        }),
        getMnemonic: () => new mnemonic_1.default(btc_1.btcFixture.mnemonic),
        getBitcoin: () => new bitcoin_1.default(new mnemonic_1.default(btc_1.btcFixture.mnemonic), network),
        getConnector: jest.fn(),
    };
    state_1.default.getState = jest.fn().mockReturnValue(mockState);
}
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
function sendPsbtMessage(psbt) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "signPsbt",
            origin: {
                internal: true,
            },
            args: {
                psbt,
            },
        };
        return yield (0, signPsbt_1.default)(message);
    });
}
function sendGetPsbtPreviewMessage(psbt) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "getPsbtPreview",
            origin: {
                internal: true,
            },
            args: {
                psbt,
            },
        };
        return yield (0, getPsbtPreview_1.default)(message);
    });
}
describe("signPsbt", () => {
    test("1 input, taproot, regtest", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        mockSettings("regtest");
        const result = yield sendPsbtMessage(btc_1.btcFixture.regtestTaprootPsbt);
        if (!result.data) {
            throw new Error("Result should have data");
        }
        expect(result.data).not.toBe(undefined);
        expect((_a = result.data) === null || _a === void 0 ? void 0 : _a.signed).not.toBe(undefined);
        expect(result.error).toBe(undefined);
        expect((_b = result.data) === null || _b === void 0 ? void 0 : _b.signed).toBe(btc_1.btcFixture.regtestTaprootSignedPsbt);
    }));
});
describe("signPsbt input validation", () => {
    test("invalid psbt", () => __awaiter(void 0, void 0, void 0, function* () {
        mockSettings("regtest");
        const result = yield sendPsbtMessage("test");
        expect(result.error).not.toBe(null);
    }));
});
describe("decode psbt", () => {
    test("get taproot transaction preview", () => __awaiter(void 0, void 0, void 0, function* () {
        mockSettings("regtest");
        const previewResponse = yield sendGetPsbtPreviewMessage(btc_1.btcFixture.regtestTaprootPsbt);
        const preview = previewResponse.data;
        expect(preview.inputs.length).toBe(1);
        expect(preview.inputs[0].address).toBe("bcrt1p8wpt9v4frpf3tkn0srd97pksgsxc5hs52lafxwru9kgeephvs7rqjeprhg");
        expect(preview.inputs[0].amount).toBe(10000000);
        expect(preview.outputs.length).toBe(2);
        expect(preview.outputs[0].address).toBe("bcrt1p6uav7en8k7zsumsqugdmg5j6930zmzy4dg7jcddshsr0fvxlqx7qnc7l22");
        expect(preview.outputs[0].amount).toBe(4999845);
        expect(preview.outputs[1].address).toBe("bcrt1p90h6z3p36n9hrzy7580h5l429uwchyg8uc9sz4jwzhdtuhqdl5eqkcyx0f");
        expect(preview.outputs[1].amount).toBe(5000000);
        expect(preview.fee).toBe(155);
    }));
    test("get taproot transaction preview 2", () => __awaiter(void 0, void 0, void 0, function* () {
        mockSettings("testnet");
        const previewResponse = yield sendGetPsbtPreviewMessage(btc_1.btcFixture.taprootPsbt2);
        const preview = previewResponse.data;
        expect(preview.inputs.length).toBe(1);
        // first address from mnemonic 1
        expect(preview.inputs[0].address).toBe("tb1p8wpt9v4frpf3tkn0srd97pksgsxc5hs52lafxwru9kgeephvs7rqlqt9zj");
        expect(preview.inputs[0].amount).toBe(2700);
        expect(preview.outputs.length).toBe(2);
        // first address from mnemonic 2
        expect(preview.outputs[0].address).toBe("tb1pmgqzlvj3kcnsaxvnvnjrfm2kyx2k9ddfp84ty6hx0972gz85gg3slq3j59");
        expect(preview.outputs[0].amount).toBe(100);
        // change sent back to original address
        expect(preview.outputs[1].address).toBe("tb1p8wpt9v4frpf3tkn0srd97pksgsxc5hs52lafxwru9kgeephvs7rqlqt9zj");
        expect(preview.outputs[1].amount).toBe(1600);
        expect(preview.fee).toBe(1000);
    }));
});
