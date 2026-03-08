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
const state_1 = __importDefault(require("~/extension/background-script/state"));
const btc_1 = require("~/fixtures/btc");
const get_1 = __importDefault(require("../get"));
jest.mock("~/extension/background-script/state");
const mockState = {
    getConnector: () => ({
        getInfo: () => Promise.resolve({ data: { alias: "getalby.com" } }),
        getBalance: () => Promise.resolve({ data: { balance: 0 } }),
    }),
    getAccount: () => ({
        config: "U2FsdGVkX19YMFK/8YpN5XQbMsmbVmlOJgpZCIRlt25K6ur4EPp4XdRUQC7+ep/m1k8d2yy69QfuGpsgn2SZOv4DQaPsdYTTwjj0mibQG/dkJ9OCp88zXuMpconrmRu5w4uZWEvdg7p5GQfIYJCvTPLUq+1zH3iH0xX7GhlrlQ8=",
        connector: "lndhub",
        id: "1e1e8ea6-493e-480b-9855-303d37506e97",
        name: "Alby",
    }),
    currentAccountId: "1e1e8ea6-493e-480b-9855-303d37506e97",
    accounts: {
        "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e": {
            config: "config-123-456",
            connector: "lndhub",
            id: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
            name: "Alby",
            nostrPrivateKey: "nostr-123-456",
            mnemonic: btc_1.btcFixture.mnemonic,
            bitcoinNetwork: "regtest",
            useMnemonicForLnurlAuth: true,
            isMnemonicBackupDone: true,
        },
        "1e1e8ea6-493e-480b-9855-303d37506e97": {
            config: "config-123-456",
            connector: "lndhub",
            id: "1e1e8ea6-493e-480b-9855-303d37506e97",
            name: "Alby",
        },
    },
};
describe("account info", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("get current account info", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            origin: { internal: true },
            prompt: true,
            action: "getAccount",
        };
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        const result = {
            id: "1e1e8ea6-493e-480b-9855-303d37506e97",
            name: "Alby",
            connectorType: "lndhub",
            nostrEnabled: false,
            liquidEnabled: false,
            hasMnemonic: false,
            hasSeenInfoBanner: false,
            hasImportedNostrKey: true,
            bitcoinNetwork: "bitcoin",
            useMnemonicForLnurlAuth: false,
            isMnemonicBackupDone: true,
        };
        expect(yield (0, get_1.default)(message)).toStrictEqual({
            data: result,
        });
    }));
    test("get account info by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            origin: { internal: true },
            prompt: true,
            args: { id: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e" },
            action: "getAccount",
        };
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        const result = {
            id: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
            name: "Alby",
            connectorType: "lndhub",
            nostrEnabled: true,
            liquidEnabled: true,
            hasMnemonic: true,
            hasSeenInfoBanner: false,
            hasImportedNostrKey: true,
            bitcoinNetwork: "regtest",
            useMnemonicForLnurlAuth: true,
            isMnemonicBackupDone: true,
        };
        expect(yield (0, get_1.default)(message)).toStrictEqual({
            data: result,
        });
    }));
});
