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
const signMessage_1 = __importDefault(require("../signMessage"));
// suppress console logs when running tests
console.error = jest.fn();
jest.mock("~/common/lib/utils", () => ({
    openPrompt: jest.fn(() => Promise.resolve({ data: {} })),
}));
// overwrite "connector" in tests later
let connector;
const ConnectorClass = jest.fn().mockImplementation(() => {
    return connector;
});
jest.mock("~/extension/background-script/state", () => ({
    getState: () => ({
        getConnector: jest.fn(() => Promise.resolve(new ConnectorClass())),
    }),
}));
const message = {
    action: "signMessage",
    application: "LBE",
    args: { message: "hello sign me" },
    origin: { internal: true },
    prompt: true,
};
const requestResponse = {
    data: {
        message: "hello sign me",
        signature: "123456789",
    },
};
const fullConnector = {
    // hacky fix because Jest doesn't return constructor name
    constructor: {
        name: "lnd",
    },
    signMessage: jest.fn(() => Promise.resolve(requestResponse)),
    supportedMethods: [
        // saved and compared in lowercase
        "getinfo",
        "makeinvoice",
        "sendpayment",
    ],
};
// resets after every test
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.clearAllMocks();
    // set a default connector if overwritten in a previous test
    connector = fullConnector;
}));
describe("ln signMessage", () => {
    describe("throws error", () => {
        test("if the message consists of canonical strings", () => __awaiter(void 0, void 0, void 0, function* () {
            const messageWithCanonicalString = Object.assign(Object.assign({}, message), { args: {
                    message: "DO NOT EVER SIGN THIS TEXT",
                } });
            const result = yield (0, signMessage_1.default)(messageWithCanonicalString);
            expect(result).toStrictEqual({
                error: "forbidden",
            });
        }));
        test("if the message is not of type string", () => __awaiter(void 0, void 0, void 0, function* () {
            const messageWithNumber = Object.assign(Object.assign({}, message), { args: {
                    message: 12345,
                } });
            const result = yield (0, signMessage_1.default)(messageWithNumber);
            expect(result).toStrictEqual({
                error: "Message missing.",
            });
        }));
    });
    describe("directly signs the message", () => {
        test("if permission for this request exists and is enabled", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, signMessage_1.default)(message);
            expect(result).toStrictEqual(requestResponse);
        }));
    });
});
