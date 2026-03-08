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
const request_1 = __importDefault(require("../request"));
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
    method: "webln/lnd/listchannels",
    blocked: false,
    enabled: true,
};
const message = {
    action: "request",
    origin: { host: allowanceInDB.host },
    args: {
        method: "listchannels",
        params: {},
    },
};
const requestResponse = { data: [] };
const fullConnector = {
    // hacky fix because Jest doesn't return constructor name
    constructor: {
        name: "lnd",
    },
    requestMethod: jest.fn(() => Promise.resolve(requestResponse)),
    supportedMethods: [
        // saved and compared in lowercase
        "request.listchannels",
        "request.listpeers",
    ],
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
describe("ln request", () => {
    describe("throws error", () => {
        test("if connector does not support requestMethod", () => __awaiter(void 0, void 0, void 0, function* () {
            connector = Object.assign(Object.assign({}, fullConnector), { supportedMethods: ["request.routermc"] });
            const result = yield (0, request_1.default)(message);
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(result).toStrictEqual({
                error: "listchannels is not supported by your account",
            });
        }));
        test("with unsupported method in message", () => __awaiter(void 0, void 0, void 0, function* () {
            const messageWithUnsupportedMethod = Object.assign(Object.assign({}, message), { args: Object.assign(Object.assign({}, message.args), { method: "methodWithCamelCase" }) });
            const result = yield (0, request_1.default)(messageWithUnsupportedMethod);
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(result).toStrictEqual({
                error: "methodwithcamelcase is not supported by your account",
            });
        }));
        test("if the host's allowance does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const messageWithUndefinedAllowanceHost = Object.assign(Object.assign({}, message), { origin: Object.assign(Object.assign({}, message.origin), { host: "some-host" }) });
            const result = yield (0, request_1.default)(messageWithUndefinedAllowanceHost);
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(result).toStrictEqual({
                error: "Could not find an allowance for this host",
            });
        }));
        test("if the request itself throws", () => __awaiter(void 0, void 0, void 0, function* () {
            connector = Object.assign(Object.assign({}, fullConnector), { requestMethod: jest.fn(() => Promise.reject(new Error("Some API error"))) });
            const result = yield (0, request_1.default)(message);
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(result).toStrictEqual({
                error: "Some API error",
            });
        }));
        test("if the message args are not correct", () => __awaiter(void 0, void 0, void 0, function* () {
            const messageWithoutMethod = Object.assign(Object.assign({}, message), { args: Object.assign(Object.assign({}, message.args), { method: undefined }) });
            const result = yield (0, request_1.default)(messageWithoutMethod);
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(result).toStrictEqual({
                error: "Request method is missing or not correct",
            });
        }));
    });
    describe("directly calls requestMethod of Connector with method and params", () => {
        test("if permission for this request exists and is enabled", () => __awaiter(void 0, void 0, void 0, function* () {
            // prepare DB with matching permission
            yield db_1.default.permissions.bulkAdd([permissionInDB]);
            const result = yield (0, request_1.default)(message);
            expect(connector.requestMethod).toHaveBeenCalledWith(message.args.method.toLowerCase(), message.args.params);
            expect(utils_1.default.openPrompt).not.toHaveBeenCalled();
            expect(result).toStrictEqual(requestResponse);
        }));
    });
    describe("prompts the user first and then calls requestMethod", () => {
        test("if the permission for this request does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            // prepare DB with other permission
            const otherPermission = Object.assign(Object.assign({}, permissionInDB), { method: "webln/sendpayment" });
            yield db_1.default.permissions.bulkAdd([otherPermission]);
            const result = yield (0, request_1.default)(message);
            expect(utils_1.default.openPrompt).toHaveBeenCalledWith({
                args: {
                    requestPermission: {
                        method: message.args.method.toLowerCase(),
                        description: "lnd.listchannels",
                    },
                },
                origin: message.origin,
                action: "public/confirmRequestPermission",
            });
            expect(connector.requestMethod).toHaveBeenCalledWith(message.args.method.toLowerCase(), message.args.params);
            expect(result).toStrictEqual(requestResponse);
        }));
        test("if the permission for this request exists but is not enabled", () => __awaiter(void 0, void 0, void 0, function* () {
            // prepare DB with disabled permission
            const disabledPermission = Object.assign(Object.assign({}, permissionInDB), { enabled: false });
            yield db_1.default.permissions.bulkAdd([disabledPermission]);
            const result = yield (0, request_1.default)(message);
            expect(utils_1.default.openPrompt).toHaveBeenCalledWith({
                args: {
                    requestPermission: {
                        method: message.args.method.toLowerCase(),
                        description: "lnd.listchannels",
                    },
                },
                origin: message.origin,
                action: "public/confirmRequestPermission",
            });
            expect(connector.requestMethod).toHaveBeenCalledWith(message.args.method.toLowerCase(), message.args.params);
            expect(result).toStrictEqual(requestResponse);
        }));
    });
    describe("on the user's prompt response", () => {
        test("saves the permission if enabled 'true'", () => __awaiter(void 0, void 0, void 0, function* () {
            utils_1.default.openPrompt.mockResolvedValueOnce({
                data: { enabled: true, blocked: false },
            });
            // prepare DB with a permission
            yield db_1.default.permissions.bulkAdd([permissionInDB]);
            const listPeersMessage = Object.assign(Object.assign({}, message), { args: Object.assign(Object.assign({}, message.args), { method: "listpeers" }) });
            expect(yield db_1.default.permissions.toArray()).toHaveLength(1);
            expect(yield db_1.default.permissions.get({ method: "webln/lnd/listpeers" })).toBeUndefined();
            const result = yield (0, request_1.default)(listPeersMessage);
            expect(utils_1.default.openPrompt).toHaveBeenCalledTimes(1);
            expect(connector.requestMethod).toHaveBeenCalledWith(listPeersMessage.args.method.toLowerCase(), listPeersMessage.args.params);
            expect(yield db_1.default.permissions.toArray()).toHaveLength(2);
            const addedPermission = yield db_1.default.permissions.get({
                method: "webln/lnd/listchannels",
            });
            expect(addedPermission).toEqual(expect.objectContaining({
                method: "webln/lnd/listchannels",
                enabled: true,
                allowanceId: allowanceInDB.id,
                host: allowanceInDB.host,
                blocked: false,
            }));
            expect(result).toStrictEqual(requestResponse);
        }));
        test("doesn't call requestMethod if clicks cancel", () => __awaiter(void 0, void 0, void 0, function* () {
            utils_1.default.openPrompt.mockImplementationOnce(() => {
                throw new Error();
            });
            // prepare DB with a permission
            yield db_1.default.permissions.bulkAdd([permissionInDB]);
            const messageWithOtherPermission = Object.assign(Object.assign({}, message), { args: Object.assign(Object.assign({}, message.args), { method: "listpeers" }) });
            expect(yield db_1.default.permissions.toArray()).toHaveLength(1);
            expect(yield db_1.default.permissions.get({ method: "webln/lnd/listpeers" })).toBeUndefined();
            const result = yield (0, request_1.default)(messageWithOtherPermission);
            expect(utils_1.default.openPrompt).toHaveBeenCalledTimes(1);
            expect(connector.requestMethod).not.toHaveBeenCalled();
            expect(yield db_1.default.permissions.toArray()).toHaveLength(1);
            expect(yield db_1.default.permissions.get({ method: "webln/lnd/listpeers" })).toBeUndefined();
            expect(result).toHaveProperty("error");
        }));
        test("does not save the permission if enabled 'false'", () => __awaiter(void 0, void 0, void 0, function* () {
            utils_1.default.openPrompt.mockResolvedValueOnce({
                data: { enabled: false, blocked: false },
            });
            // prepare DB with a permission
            yield db_1.default.permissions.bulkAdd([permissionInDB]);
            const listPeersMessage = Object.assign(Object.assign({}, message), { args: Object.assign(Object.assign({}, message.args), { method: "listpeers" }) });
            expect(yield db_1.default.permissions.toArray()).toHaveLength(1);
            expect(yield db_1.default.permissions.get({ method: "webln/lnd/listpeers" })).toBeUndefined();
            const result = yield (0, request_1.default)(listPeersMessage);
            expect(utils_1.default.openPrompt).toHaveBeenCalledTimes(1);
            expect(connector.requestMethod).toHaveBeenCalledWith(listPeersMessage.args.method.toLowerCase(), listPeersMessage.args.params);
            expect(yield db_1.default.permissions.toArray()).toHaveLength(1);
            expect(yield db_1.default.permissions.get({ method: "webln/lnd/listpeers" })).toBeUndefined();
            expect(result).toStrictEqual(requestResponse);
        }));
    });
});
