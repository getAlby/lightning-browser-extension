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
const settings_1 = require("~/../tests/fixtures/settings");
const mnemonic_1 = __importDefault(require("~/extension/background-script/mnemonic"));
const state_1 = __importDefault(require("~/extension/background-script/state"));
const btc_1 = require("~/fixtures/btc");
const auth_1 = require("../auth");
let fetchedUrl;
jest.mock("~/extension/background-script/state");
jest.mock("axios", () => ({
    get: (requestUrl) => {
        fetchedUrl = requestUrl;
        return { data: { status: "OK" } };
    },
}));
const passwordMock = jest.fn;
describe("auth with mnemonic", () => {
    test("getPathSuffix matches test vector", () => {
        expect((0, auth_1.getPathSuffix)("site.com", "7d417a6a5e9a6a4a879aeaba11a11838764c8fa2b959c242d43dea682b3e409b")).toStrictEqual([1588488367, 2659270754, 38110259, 4136336762]);
    });
    test("matches LUD05 test vector", () => __awaiter(void 0, void 0, void 0, function* () {
        const lnurlDetails = {
            domain: "site.com",
            k1: "dea6a5e410ae8db8872b30ed715d9c10bbaca1dda653396511a40bb353529572",
            tag: "login",
            url: "https://site.com/lnurl-login",
        };
        const mockState = {
            password: passwordMock,
            currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
            getAccount: () => ({
                mnemonic: btc_1.btcFixture.mnemonic,
                bitcoinNetwork: "regtest",
                useMnemonicForLnurlAuth: true,
            }),
            getMnemonic: () => new mnemonic_1.default(btc_1.btcFixture.mnemonic),
            getConnector: jest.fn(),
        };
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        expect(yield (0, auth_1.authFunction)({ lnurlDetails })).toStrictEqual({
            success: true,
            status: "OK",
            reason: undefined,
            authResponseData: { status: "OK" },
        });
        // ensure the public key is constant for the given mnemonic
        expect(new URL(fetchedUrl).searchParams.get("key")).toBe("027da5d64331f61260eb8e2b356403446555f525bc7dc35b991ec1447e4f58991f");
    }));
});
// FIXME: this test is doing a real API call, and does not
// test if the user logs in to the correct account or not
describe.skip("auth", () => {
    const mockState = {
        settings: settings_1.settingsFixture,
        getConnector: () => ({
            signMessage: () => Promise.resolve({
                data: {
                    signature: "rnu5pnhanjs3bfxz33fuyf9ywzrmkm1ns6jxdraxff1irq3hpxcbkce6zk34ee9bh7bamgd891tfy4gq1y119w53qg1ap5zodwi4u51n",
                },
            }),
        }),
    };
    test("returns success response", () => __awaiter(void 0, void 0, void 0, function* () {
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        const lnurlDetails = {
            domain: "lnurl.fiatjaf.com",
            k1: "dea6a5e410ae8db8872b30ed715d9c10bbaca1dda653396511a40bb353529572",
            tag: "login",
            url: "https://lnurl.fiatjaf.com/lnurl-login",
        };
        expect(yield (0, auth_1.authFunction)({ lnurlDetails })).toStrictEqual({
            success: true,
            status: "OK",
            reason: undefined,
            authResponseData: { status: "OK" },
        });
    }));
    test("fails gracefully if no status is set", () => __awaiter(void 0, void 0, void 0, function* () {
        const lnurlDetails = {
            domain: "lnurl.fiatjaf.com",
            k1: "dea6a5e410ae8db8872b30ed715d9c10bbaca1dda653396511a40bb353529572",
            tag: "login",
            url: "https://lnurl.fiatjaf.com/lnurl-login-fail",
        };
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        expect(() => (0, auth_1.authFunction)({ lnurlDetails })).rejects.toThrowError("Auth: Something went wrong");
    }));
});
