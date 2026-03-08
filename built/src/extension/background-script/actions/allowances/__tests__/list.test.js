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
const list_1 = __importDefault(require("../list"));
const mockPayments = payment_1.paymentsFixture;
const mockAllowances = allowances_1.allowanceFixture;
const resultAllowances = [
    Object.assign(Object.assign({}, mockAllowances[1]), { id: 2, payments: [], paymentsAmount: 0, paymentsCount: 0, percentage: 0, usedBudget: 0 }),
    Object.assign(Object.assign({}, mockAllowances[0]), { id: 1, payments: [], paymentsAmount: 3000, paymentsCount: 2, percentage: 0, usedBudget: 0 }),
];
describe("list allowances", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("list allowances", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "listAllowances",
            origin: {
                internal: true,
            },
        };
        yield db_1.default.payments.bulkAdd(mockPayments);
        yield db_1.default.allowances.bulkAdd(mockAllowances);
        expect(yield (0, list_1.default)(message)).toStrictEqual({
            data: {
                allowances: resultAllowances,
            },
        });
    }));
});
