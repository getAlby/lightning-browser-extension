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
const update_1 = __importDefault(require("../update"));
const mockAllowances = allowances_1.allowanceFixture;
db_1.default.allowances.bulkAdd(mockAllowances);
describe("update allowance", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("setting props via update", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "updateAllowance",
            origin: {
                internal: true,
            },
            args: {
                id: 2,
                totalBudget: 1500,
                enabled: true,
                lnurlAuth: true,
            },
        };
        expect(yield (0, update_1.default)(message)).toStrictEqual({
            data: 1,
        });
        const allowance = yield db_1.default.allowances.get(2);
        expect(allowance === null || allowance === void 0 ? void 0 : allowance.totalBudget).toEqual(1500);
        expect(allowance === null || allowance === void 0 ? void 0 : allowance.enabled).toEqual(true);
        expect(allowance === null || allowance === void 0 ? void 0 : allowance.lnurlAuth).toEqual(true);
    }));
    test("set enable and lnurlAuth to false", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "updateAllowance",
            origin: {
                internal: true,
            },
            args: {
                id: 1,
                enabled: false,
                lnurlAuth: false,
            },
        };
        expect(yield (0, update_1.default)(message)).toStrictEqual({
            data: 1,
        });
        const allowance = yield db_1.default.allowances.get(1);
        expect(allowance === null || allowance === void 0 ? void 0 : allowance.enabled).toEqual(false);
        expect(allowance === null || allowance === void 0 ? void 0 : allowance.lnurlAuth).toEqual(false);
    }));
});
