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
const edit_1 = __importDefault(require("../edit"));
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
const mockState = {
    saveToStorage: jest.fn,
    accounts: {
        "888": {
            config: "abc",
            connector: "lnd",
            name: "BLUE",
        },
        "666": {
            config: "xyz",
            connector: "lnd",
            name: "GREEN",
        },
    },
};
describe("edit account", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("edit existing account", () => __awaiter(void 0, void 0, void 0, function* () {
        chrome.storage.session.get.mockResolvedValue({
            password: 123456,
        });
        const message = {
            application: "LBE",
            args: {
                id: "888",
                name: "purple",
            },
            origin: { internal: true },
            prompt: true,
            action: "editAccount",
        };
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        state_1.default.setState = () => jest.fn;
        const spy = jest.spyOn(state_1.default, "setState");
        expect(yield (0, edit_1.default)(message)).toStrictEqual({});
        expect(spy).toHaveBeenNthCalledWith(1, {
            accounts: {
                "666": {
                    config: "xyz",
                    connector: "lnd",
                    name: "GREEN",
                },
                "888": {
                    config: "abc",
                    connector: "lnd",
                    name: "purple",
                },
            },
        });
        expect(spy).toHaveBeenCalledTimes(1);
    }));
    test("edit non-existing account should error", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            args: {
                id: "123",
                name: "orange",
            },
            origin: { internal: true },
            prompt: true,
            action: "editAccount",
        };
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        state_1.default.setState = () => jest.fn;
        const spy = jest.spyOn(state_1.default, "setState");
        expect(yield (0, edit_1.default)(message)).toStrictEqual({
            error: "Account not found: 123",
        });
        expect(spy).not.toHaveBeenCalled();
    }));
});
