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
const delete_1 = __importDefault(require("../delete"));
const mockAllowances = allowances_1.allowanceFixture;
const mockPermissions = [
    {
        id: 1,
        accountId: "123456",
        allowanceId: 1,
        createdAt: "1667291216372",
        host: "getalby.com",
        method: "webln/listchannels",
        blocked: false,
        enabled: true,
    },
    {
        id: 2,
        accountId: "123456",
        allowanceId: 2,
        createdAt: "1667291216372",
        host: "lnmarkets.com",
        method: "webln/getinfo",
        blocked: false,
        enabled: true,
    },
    {
        id: 3,
        accountId: "123456",
        allowanceId: 2,
        createdAt: "1667291216372",
        host: "lnmarkets.com",
        method: "webln/signmessage",
        blocked: false,
        enabled: true,
    },
];
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.allowances.bulkAdd(mockAllowances);
    yield db_1.default.permissions.bulkAdd(mockPermissions);
}));
afterEach(() => {
    jest.clearAllMocks();
});
describe("delete allowance", () => {
    test("deletes allowance and the corresponding permissions", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "deleteAllowance",
            origin: {
                internal: true,
            },
            args: {
                id: 2,
            },
        };
        expect(yield (0, delete_1.default)(message)).toStrictEqual({
            data: true,
        });
        const dbAllowances = yield db_1.default.allowances
            .toCollection()
            .reverse()
            .sortBy("lastPaymentAt");
        expect(dbAllowances).toEqual([
            {
                enabled: true,
                host: "getalby.com",
                id: 1,
                imageURL: "https://getalby.com/favicon.ico",
                lastPaymentAt: 0,
                enabledFor: ["webln"],
                lnurlAuth: true,
                name: "Alby: Your Bitcoin & Nostr companion for the web",
                remainingBudget: 500,
                totalBudget: 500,
                createdAt: "123456",
                tag: "",
            },
        ]);
        const dbPermissions = yield db_1.default.permissions.toArray();
        expect(dbPermissions).toEqual([mockPermissions[0]]);
    }));
});
