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
const decryptedDetails_1 = __importDefault(require("../decryptedDetails"));
jest.mock("~/extension/background-script/state");
jest.mock("uuid", () => {
    return {
        v4: jest.fn(() => "random-id-42"),
    };
});
jest.mock("~/common/lib/crypto", () => {
    return {
        decryptData: jest.fn(() => {
            return {
                lnAddress: "test@app.regtest.getalby.com",
                login: "123456789",
                password: "abcdefghi",
                url: "https://lndhub.regtest.getalby.com",
            };
        }),
    };
});
const mockState = {
    password: jest.fn,
    saveToStorage: jest.fn,
    accounts: {
        "888": {
            config: "abc",
            connector: "lndhub",
            name: "BLUE",
        },
        "666": {
            config: "xyz",
            connector: "umbrel",
            name: "GREEN",
        },
    },
};
describe("export account", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("export existing lndhub account", () => __awaiter(void 0, void 0, void 0, function* () {
        chrome.storage.session.get.mockResolvedValue({
            password: 123456,
        });
        const message = {
            application: "LBE",
            args: {
                id: "888",
                name: "BLUE",
            },
            origin: { internal: true },
            prompt: true,
            action: "accountDecryptedDetails",
        };
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        expect(yield (0, decryptedDetails_1.default)(message)).toStrictEqual({
            data: {
                lnAddress: "test@app.regtest.getalby.com",
                login: "123456789",
                password: "abcdefghi",
                url: "https://lndhub.regtest.getalby.com",
            },
        });
    }));
    test("export non-existing account should error", () => __awaiter(void 0, void 0, void 0, function* () {
        chrome.storage.session.get.mockResolvedValue({
            password: 123456,
        });
        const message = {
            application: "LBE",
            args: {
                id: "123",
                name: "ORANGE",
            },
            origin: { internal: true },
            prompt: true,
            action: "accountDecryptedDetails",
        };
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        expect(yield (0, decryptedDetails_1.default)(message)).toStrictEqual({
            error: "Account not found: 123",
        });
    }));
});
