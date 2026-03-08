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
const liquidjs_lib_1 = require("liquidjs-lib");
const signPset_1 = __importDefault(require("~/extension/background-script/actions/liquid/signPset"));
const liquid_1 = __importDefault(require("~/extension/background-script/liquid"));
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
afterEach(() => {
    jest.clearAllMocks();
});
function sendSignPsetMessage(pset) {
    const message = {
        application: "LBE",
        prompt: true,
        action: "signPset",
        origin: {
            internal: true,
        },
        args: {
            pset,
        },
    };
    return (0, signPset_1.default)(message);
}
describe("signPset", () => {
    for (const { unsignedPset, description, finalizedPset, } of liquid_2.liquidFixtureSign.psets) {
        it(`should sign ${description}`, () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const result = yield sendSignPsetMessage(unsignedPset);
            if (!(result === null || result === void 0 ? void 0 : result.data)) {
                throw new Error("Result should have data");
            }
            expect(result.data).not.toBe(undefined);
            expect((_a = result.data) === null || _a === void 0 ? void 0 : _a.signed).not.toBe(undefined);
            expect(result.error).toBe(undefined);
            const signedPset = liquidjs_lib_1.Pset.fromBase64(result.data.signed);
            expect(signedPset.inputs.every((i) => !i.isFinalized())).toBe(true);
            const finalizer = new liquidjs_lib_1.Finalizer(signedPset);
            finalizer.finalize();
            expect(finalizer.pset.toBase64()).toBe(finalizedPset);
        }));
    }
});
describe("signPset input validation", () => {
    test("invalid pset", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield sendSignPsetMessage("test");
        expect(result.error).not.toBe(null);
    }));
});
