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
const get_1 = __importDefault(require("../../actions/allowances/get"));
const allowances_2 = require("../allowances");
Date.now = jest.fn(() => 1487076708000);
const mockAllowances = allowances_1.allowanceFixture;
const data = {
    accountId: "123456",
    response: {
        data: {
            preimage: "123",
            paymentHash: "123",
            route: {
                total_amt: 50,
                total_fees: 2,
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
describe("Update Allowances", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("Updates allowances after successful payment", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "getAllowance",
            origin: {
                internal: true,
            },
            args: {
                host: "getalby.com",
            },
        };
        yield db_1.default.allowances.bulkAdd(mockAllowances);
        yield (0, allowances_2.updateAllowance)("ln.sendPayment.success", data);
        expect(yield (0, get_1.default)(message)).toEqual({
            data: Object.assign(Object.assign({}, mockAllowances[0]), { payments: [], lastPaymentAt: 1487076708000, paymentsAmount: 0, paymentsCount: 0, percentage: 10, remainingBudget: 450, usedBudget: 50 }),
        });
    }));
});
