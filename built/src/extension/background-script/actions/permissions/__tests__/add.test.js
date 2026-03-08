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
const state_1 = __importDefault(require("~/extension/background-script/state"));
const allowances_1 = require("~/fixtures/allowances");
const permissions_1 = require("~/fixtures/permissions");
const add_1 = __importDefault(require("../add"));
jest.mock("~/extension/background-script/state");
const defaultMockState = {
    currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
};
const mockState = defaultMockState;
state_1.default.getState = jest.fn().mockReturnValue(mockState);
Date.now = jest.fn(() => 1487076708000);
const mockAllowances = [allowances_1.allowanceFixture[0]];
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.permissions.clear();
    yield db_1.default.allowances.clear();
    // fill the DB first
    yield db_1.default.allowances.bulkAdd(mockAllowances);
}));
afterEach(() => {
    jest.clearAllMocks();
});
describe("add permission", () => {
    test("saves enabled permissions", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "addPermission",
            origin: {
                internal: true,
            },
            args: {
                host: mockAllowances[0].host,
                method: "the-request-method-1",
                enabled: true,
                blocked: false,
            },
        };
        yield (0, add_1.default)(message);
        const dbPermissions = yield db_1.default.permissions.toArray();
        expect(dbPermissions).toStrictEqual([permissions_1.permissionsFixture[0]]);
    }));
    test("saves disabled permissions", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "addPermission",
            origin: {
                internal: true,
            },
            args: {
                host: mockAllowances[0].host,
                method: "the-request-method-2",
                enabled: true,
                blocked: true,
            },
        };
        yield (0, add_1.default)(message);
        const dbPermissions = yield db_1.default.permissions.toArray();
        expect(dbPermissions).toStrictEqual([permissions_1.permissionsFixture[1]]);
    }));
});
