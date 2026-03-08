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
const allowances_1 = require("~/fixtures/allowances");
const keysend_1 = __importDefault(require("../keysend"));
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
        currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
    }),
}));
const allowanceInDB = allowances_1.allowanceFixture[0];
const message = {
    action: "keysend",
    application: "LBE",
    args: {
        destination: "030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3",
        amount: "1000",
        customRecords: {
            customKey: "696969",
            customValue: "abcdefgh",
        },
    },
    origin: { host: allowanceInDB.host },
    prompt: true,
};
const requestResponse = {
    data: {
        preimage: "123",
        paymentHash: "123",
        route: {
            total_amt: 1000,
            total_fees: 2,
        },
    },
};
const fullConnector = {
    // hacky fix because Jest doesn't return constructor name
    constructor: {
        name: "lnd",
    },
    keysend: jest.fn(() => Promise.resolve(requestResponse)),
};
// resets after every test
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.clearAllMocks();
    // set a default connector if overwritten in a previous test
    connector = fullConnector;
}));
describe("ln keysend", () => {
    describe("throws error", () => {
        test("if the message doesn't have amount", () => __awaiter(void 0, void 0, void 0, function* () {
            const messageWithoutAmount = Object.assign(Object.assign({}, message), { args: {
                    destination: "030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3",
                    customRecords: {
                        customKey: "696969",
                        customValue: "abcdefgh",
                    },
                } });
            const result = yield (0, keysend_1.default)(messageWithoutAmount);
            expect(result).toStrictEqual({
                error: "Destination or amount missing.",
            });
        }));
        test("if the message doesn't have destination", () => __awaiter(void 0, void 0, void 0, function* () {
            const messageWithoutDestination = Object.assign(Object.assign({}, message), { args: {
                    amount: "1000",
                    customRecords: {
                        customKey: "696969",
                        customValue: "abcdefgh",
                    },
                } });
            const result = yield (0, keysend_1.default)(messageWithoutDestination);
            expect(result).toStrictEqual({
                error: "Destination or amount missing.",
            });
        }));
    });
    describe("makes a successful payment", () => {
        test("if amount, destination and custom records are provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, keysend_1.default)(message);
            expect(result).toStrictEqual(requestResponse);
        }));
    });
});
