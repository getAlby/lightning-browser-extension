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
const sendPayment_1 = __importDefault(require("../sendPayment"));
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
    action: "sendPayment",
    application: "LBE",
    args: {
        paymentRequest: "lnbc10n1p3st44mpp5j7dtqa0t6jctujwl8q8v07kaz363cva058l6pf4zyjv64qvuk9fshp5rdh2y59nhv3va0xqg7fmevcmypfw0e3pjq4p6yy52nu4jv76wmqqcqzpgxqyz5vqsp5lal7ervygjs3qpfvglzn472ag2e3w939mfckctpawsjyl3sslc6q9qyyssqvdjlxvgc0zrcn4ze44479x24w7r2svqv8zsp3ezemd55pdkxzwrjeeql0hvuy3d9klsmqzf8rwar8x4cplpxccnaj667p537g46txtqpxkyeuu",
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
    sendPayment: jest.fn(() => Promise.resolve(requestResponse)),
};
// resets after every test
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.clearAllMocks();
    // set a default connector if overwritten in a previous test
    connector = fullConnector;
}));
describe("ln sendPayment", () => {
    describe("throws error", () => {
        test("if the message doesn't have paymentRequest", () => __awaiter(void 0, void 0, void 0, function* () {
            const messageWithoutAmount = Object.assign(Object.assign({}, message), { args: {} });
            const result = yield (0, sendPayment_1.default)(messageWithoutAmount);
            expect(result).toStrictEqual({
                error: "Payment request missing.",
            });
        }));
        test("if the paymentRequest is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidPaymentRequest = "lnbcxyz";
            const messageWithoutDestination = Object.assign(Object.assign({}, message), { args: {
                    paymentRequest: invalidPaymentRequest,
                } });
            const result = yield (0, sendPayment_1.default)(messageWithoutDestination);
            expect(result).toStrictEqual({
                error: `${invalidPaymentRequest} too short`,
            });
        }));
    });
    describe("makes a successful payment", () => {
        test("if paymentRequest is valid", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, sendPayment_1.default)(message);
            expect(result).toStrictEqual(requestResponse);
        }));
    });
});
