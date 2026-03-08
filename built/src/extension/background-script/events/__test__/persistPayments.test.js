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
const db_1 = __importDefault(require("~/extension/background-script/db"));
const allowances_1 = require("~/fixtures/allowances");
const payment_1 = require("~/fixtures/payment");
const all_1 = __importDefault(require("../../actions/payments/all"));
const persistPayments_1 = require("../persistPayments");
Date.now = jest.fn(() => 1487076708000);
const mockAllowances = allowances_1.allowanceFixture;
const mockPayments = payment_1.paymentsFixture;
const updatedPayments = [
    ...payment_1.paymentsFixture,
    {
        accountId: "123456",
        allowanceId: "1",
        createdAt: "1487076708000",
        description: "A red bird?!",
        destination: "Space",
        host: "getalby.com",
        id: 6,
        location: "test",
        name: "Alby",
        paymentHash: "123",
        paymentRequest: "",
        preimage: "123",
        totalAmount: 2121,
        totalFees: 333,
    },
];
const updatedPaymentsWithoutOrigin = [
    ...updatedPayments,
    {
        accountId: "123456",
        allowanceId: "",
        createdAt: "1487076708000",
        description: "A blue bird?!",
        destination: "Space",
        host: "",
        id: 7,
        paymentHash: "321",
        paymentRequest: "",
        preimage: "321",
        totalAmount: 2121,
        totalFees: 333,
    },
];
const data = {
    accountId: "123456",
    response: {
        data: {
            preimage: "123",
            paymentHash: "123",
            route: {
                total_amt: 2121,
                total_fees: 333,
            },
        },
    },
    details: {
        description: "A red bird?!",
        destination: "Space",
    },
    origin: {
        location: "test",
        domain: "",
        host: "getalby.com",
        pathname: "test",
        name: "Alby",
        description: "test",
        icon: "",
        metaData: {},
        external: true,
    },
};
const dataWitouthOrigin = {
    accountId: "123456",
    response: {
        data: {
            preimage: "321",
            paymentHash: "321",
            route: {
                total_amt: 2121,
                total_fees: 333,
            },
        },
    },
    details: {
        description: "A blue bird?!",
        destination: "Space",
    },
};
db_1.default.allowances.bulkAdd(mockAllowances);
db_1.default.payments.bulkAdd(mockPayments);
describe("Persist payments", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("updates payments on persisting successful payment", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            origin: { internal: true },
            prompt: true,
            action: "getPayments",
        };
        yield (0, persistPayments_1.persistSuccessfulPayment)("ln.sendPayment.success", data);
        expect(yield (0, all_1.default)(message)).toEqual({
            data: {
                payments: [...updatedPayments.reverse()],
            },
        });
    }));
    test("updates payments on persisting successful payment with empty origin (i.e. pay to ln-address inside popup)", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            origin: { internal: true },
            prompt: true,
            action: "getPayments",
        };
        yield (0, persistPayments_1.persistSuccessfulPayment)("ln.sendPayment.success", dataWitouthOrigin);
        expect(yield (0, all_1.default)(message)).toEqual({
            data: {
                payments: [...updatedPaymentsWithoutOrigin.reverse()],
            },
        });
    }));
});
