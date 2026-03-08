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
const add_1 = __importDefault(require("../add"));
jest.mock("~/extension/background-script/state");
jest.mock("uuid", () => {
    return {
        v4: jest.fn(() => "random-id-42"),
    };
});
jest.mock("~/common/lib/crypto", () => {
    return {
        encryptData: jest.fn(() => "secret-config-string-42"),
    };
});
const defaultMockState = {
    saveToStorage: jest.fn,
    password: () => "123456",
    accounts: {},
};
const message = {
    application: "LBE",
    args: {
        connector: "lnd",
        config: "123456config",
        name: "purple",
        nostrPrivateKey: "123456nostr",
        isMnemonicBackupDone: false,
    },
    origin: { internal: true },
    prompt: true,
    action: "addAccount",
};
describe("add account to account-list", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("add first account to empty list", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockState = defaultMockState;
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        state_1.default.setState = () => jest.fn;
        const spy = jest.spyOn(state_1.default, "setState");
        expect(yield (0, add_1.default)(message)).toStrictEqual({
            data: { accountId: "random-id-42" },
        });
        expect(spy).toHaveBeenNthCalledWith(1, {
            accounts: {
                "random-id-42": {
                    id: "random-id-42",
                    connector: "lnd",
                    config: "secret-config-string-42",
                    name: "purple",
                    nostrPrivateKey: "123456nostr",
                    isMnemonicBackupDone: false,
                },
            },
        });
        expect(spy).toHaveBeenNthCalledWith(2, {
            currentAccountId: "random-id-42",
        });
        expect(spy).toHaveBeenCalledTimes(2);
    }));
    test("add new account to existing list", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockState = Object.assign(Object.assign({}, defaultMockState), { currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e", accounts: {
                "888": {
                    config: "abc",
                    connector: "lnd",
                    name: "BLUE",
                    nostrPrivateKey: "123",
                },
                "666": {
                    config: "xyz",
                    connector: "lnd",
                    name: "GREEN",
                    nostrPrivateKey: "123",
                },
            } });
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        state_1.default.setState = () => jest.fn;
        const spy = jest.spyOn(state_1.default, "setState");
        expect(yield (0, add_1.default)(message)).toStrictEqual({
            data: { accountId: "random-id-42" },
        });
        expect(spy).toHaveBeenNthCalledWith(1, {
            accounts: {
                "random-id-42": {
                    id: "random-id-42",
                    connector: "lnd",
                    config: "secret-config-string-42",
                    name: "purple",
                    nostrPrivateKey: "123456nostr",
                    isMnemonicBackupDone: false,
                },
                "666": {
                    config: "xyz",
                    connector: "lnd",
                    name: "GREEN",
                    nostrPrivateKey: "123",
                },
                "888": {
                    config: "abc",
                    connector: "lnd",
                    name: "BLUE",
                    nostrPrivateKey: "123",
                },
            },
        });
        expect(spy).toHaveBeenCalledTimes(1);
    }));
});
