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
const utils_1 = __importDefault(require("~/common/lib/utils"));
const db_1 = __importDefault(require("~/extension/background-script/db"));
const state_1 = __importDefault(require("~/extension/background-script/state"));
const allowances_1 = require("~/fixtures/allowances");
const enable_1 = __importDefault(require("../../webln/enable"));
jest.mock("~/extension/background-script/state");
const defaultMockState = {
    password: "123456",
    saveToStorage: jest.fn,
    accounts: {},
    isUnlocked: jest.fn(() => true),
};
const mockState = defaultMockState;
state_1.default.getState = jest.fn().mockReturnValue(mockState);
utils_1.default.openPrompt = jest
    .fn()
    .mockReturnValue({ data: { enabled: true, remember: true } });
const mockAllowances = [Object.assign({}, allowances_1.allowanceFixture[0])];
describe("enable allowance", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("enable allowance", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "public/webln/enable",
            origin: {
                location: "test",
                domain: "",
                host: "lnmarkets.com",
                pathname: "test",
                name: "LN Markets",
                description: "test",
                icon: "",
                metaData: {},
                external: true,
            },
            args: {
                host: "lnmarkets.com",
            },
        };
        const sender = {
            documentId: "ALBY123",
            documentLifecycle: "active",
            id: "alby",
            origin: `https://lnmarkets.com`,
            url: `https://lnmarkets.com/test`,
        };
        yield db_1.default.allowances.bulkAdd(mockAllowances);
        expect(yield (0, enable_1.default)(message, sender)).toStrictEqual({
            data: {
                enabled: true,
                remember: true,
            },
        });
        const allowance = yield db_1.default.allowances.get(2);
        expect(allowance === null || allowance === void 0 ? void 0 : allowance.enabled).toEqual(true);
    }));
    test("enable an already enabled allowance", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "public/webln/enable",
            origin: {
                location: "test",
                domain: "",
                host: "getalby.com",
                pathname: "test",
                name: "Alby: Your Bitcoin & Nostr companion for the web",
                description: "test",
                icon: "",
                metaData: {},
                external: true,
            },
            args: {
                host: "getalby.com",
            },
        };
        const sender = {
            documentId: "ALBY123",
            documentLifecycle: "active",
            id: "alby",
            origin: `https://getalby.com`,
            url: `https://getalby.com/test`,
        };
        expect(yield (0, enable_1.default)(message, sender)).toStrictEqual({
            data: {
                enabled: true,
            },
        });
    }));
});
