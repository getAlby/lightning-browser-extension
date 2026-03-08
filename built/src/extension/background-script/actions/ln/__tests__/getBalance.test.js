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
const webln_1 = require("~/extension/background-script/actions/webln");
const db_1 = __importDefault(require("~/extension/background-script/db"));
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
const allowanceInDB = {
    enabled: true,
    host: "getalby.com",
    id: 1,
    imageURL: "https://getalby.com/favicon.ico",
    lastPaymentAt: 0,
    lnurlAuth: true,
    name: "Alby: Your Bitcoin & Nostr companion for the web",
    remainingBudget: 500,
    totalBudget: 500,
    createdAt: "123456",
    tag: "",
};
const permissionInDB = {
    id: 1,
    accountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
    allowanceId: allowanceInDB.id,
    createdAt: "1487076708000",
    host: allowanceInDB.host,
    method: "webln.getbalance",
    blocked: false,
    enabled: true,
};
const message = {
    action: "getBalance",
    origin: { host: allowanceInDB.host },
};
const requestResponse = { data: { balance: 123 } };
const fullConnector = {
    // hacky fix because Jest doesn't return constructor name
    constructor: {
        name: "lnd",
    },
    getBalance: jest.fn(() => Promise.resolve(requestResponse)),
};
// prepare DB with allowance
db_1.default.allowances.bulkAdd([allowanceInDB]);
// resets after every test
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.clearAllMocks();
    // ensure a clear permission table in DB
    yield db_1.default.permissions.clear();
    // set a default connector if overwritten in a previous test
    connector = fullConnector;
}));
describe("throws error", () => {
    test("if the host's allowance does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
        const messageWithUndefinedAllowanceHost = Object.assign(Object.assign({}, message), { origin: Object.assign(Object.assign({}, message.origin), { host: "some-host" }) });
        const result = yield (0, webln_1.getBalanceOrPrompt)(messageWithUndefinedAllowanceHost);
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual({
            error: "Could not find an allowance for this host",
        });
    }));
    test("if the getBalance call itself throws an exception", () => __awaiter(void 0, void 0, void 0, function* () {
        connector = Object.assign(Object.assign({}, fullConnector), { getBalance: jest.fn(() => Promise.reject(new Error("Some API error"))) });
        const result = yield (0, webln_1.getBalanceOrPrompt)(message);
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(result).toStrictEqual({
            error: "Some API error",
        });
    }));
});
describe("prompts the user first and then calls getBalance", () => {
    test("if the permission for getBalance does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
        // prepare DB with other permission
        const otherPermission = Object.assign(Object.assign({}, permissionInDB), { method: "webln/sendpayment" });
        yield db_1.default.permissions.bulkAdd([otherPermission]);
        const result = yield (0, webln_1.getBalanceOrPrompt)(message);
        expect(utils_1.default.openPrompt).toHaveBeenCalledWith({
            args: {
                requestPermission: {
                    method: "getBalance",
                    description: "webln.getbalance.description",
                },
            },
            origin: message.origin,
            action: "public/confirmRequestPermission",
        });
        expect(connector.getBalance).toHaveBeenCalled();
        expect(result).toStrictEqual(requestResponse);
    }));
    test("if the permission for the getBalance exists but is not enabled", () => __awaiter(void 0, void 0, void 0, function* () {
        // prepare DB with disabled permission
        const disabledPermission = Object.assign(Object.assign({}, permissionInDB), { enabled: false });
        yield db_1.default.permissions.bulkAdd([disabledPermission]);
        const result = yield (0, webln_1.getBalanceOrPrompt)(message);
        expect(utils_1.default.openPrompt).toHaveBeenCalledWith({
            args: {
                requestPermission: {
                    method: "getBalance",
                    description: "webln.getbalance.description",
                },
            },
            origin: message.origin,
            action: "public/confirmRequestPermission",
        });
        expect(connector.getBalance).toHaveBeenCalled();
        expect(result).toStrictEqual(requestResponse);
    }));
});
describe("directly calls getBalance of Connector", () => {
    test("if permission for this website exists and is enabled", () => __awaiter(void 0, void 0, void 0, function* () {
        // prepare DB with matching permission
        yield db_1.default.permissions.bulkAdd([permissionInDB]);
        // console.log(db.permissions);
        const result = yield (0, webln_1.getBalanceOrPrompt)(message);
        expect(connector.getBalance).toHaveBeenCalled();
        expect(utils_1.default.openPrompt).not.toHaveBeenCalled();
        expect(result).toStrictEqual(requestResponse);
    }));
});
