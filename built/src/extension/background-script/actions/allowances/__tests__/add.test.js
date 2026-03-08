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
const add_1 = __importDefault(require("../add"));
Date.now = jest.fn(() => 1487076708000);
const mockAllowances = [Object.assign({}, allowances_1.allowanceFixture[0])];
describe("add allowance", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("add allowance", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "addAllowance",
            origin: {
                internal: true,
            },
            args: {
                host: "lnmarkets.com",
                name: "LN Markets",
                imageURL: "https://lnmarkets.com/apple-touch-icon.png",
                totalBudget: 200,
            },
        };
        yield db_1.default.allowances.bulkAdd(mockAllowances);
        yield (0, add_1.default)(message);
        const dbAllowances = yield db_1.default.allowances
            .toCollection()
            .reverse()
            .sortBy("lastPaymentAt");
        expect(dbAllowances).toContainEqual({
            createdAt: "1487076708000",
            enabled: true,
            host: "lnmarkets.com",
            imageURL: "https://lnmarkets.com/apple-touch-icon.png",
            lastPaymentAt: 0,
            lnurlAuth: false,
            name: "LN Markets",
            remainingBudget: 200,
            tag: "",
            totalBudget: 200,
            id: 2,
        });
    }));
});
