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
const state_1 = __importDefault(require("~/extension/background-script/state"));
const info_1 = __importDefault(require("../info"));
jest.mock("~/extension/background-script/state");
const mockState = {
    getConnector: () => ({
        getInfo: () => Promise.resolve({ data: { alias: "getalby.com" } }),
        getBalance: () => Promise.resolve({ data: { balance: 0 } }),
    }),
    getAccount: () => ({
        config: "U2FsdGVkX19YMFK/8YpN5XQbMsmbVmlOJgpZCIRlt25K6ur4EPp4XdRUQC7+ep/m1k8d2yy69QfuGpsgn2SZOv4DQaPsdYTTwjj0mibQG/dkJ9OCp88zXuMpconrmRu5w4uZWEvdg7p5GQfIYJCvTPLUq+1zH3iH0xX7GhlrlQ8=",
        connector: "lndhub",
        id: "1e1e8ea6-493e-480b-9855-303d37506e97",
        name: "Alby",
        avatarUrl: "https://example.com/avatars/1.png",
    }),
    currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
};
describe("account info", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("get account info", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            origin: { internal: true },
            prompt: true,
            action: "accountInfo",
        };
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        const result = {
            currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
            name: "Alby",
            info: { alias: "getalby.com" },
            balance: { balance: 0, currency: "BTC" },
            connectorType: "lndhub",
            avatarUrl: "https://example.com/avatars/1.png",
        };
        expect(yield (0, info_1.default)(message)).toStrictEqual({
            data: result,
        });
    }));
});
