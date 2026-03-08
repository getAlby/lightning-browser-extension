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
const allowances_1 = require("~/fixtures/allowances");
const permissions_1 = require("~/fixtures/permissions");
const types_1 = require("~/types");
const signEventOrPrompt_1 = __importDefault(require("../signEventOrPrompt"));
// suppress console logs when running tests
console.error = jest.fn();
jest.mock("~/common/lib/utils", () => ({
    openPrompt: jest.fn(() => Promise.resolve({ data: {} })),
}));
let nostr;
const NostrClass = jest.fn().mockImplementation(() => {
    return nostr;
});
jest.mock("~/extension/background-script/state", () => ({
    getState: () => ({
        getNostr: jest.fn(() => new NostrClass()),
        currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
    }),
}));
const allowanceInDB = allowances_1.allowanceFixture[0];
const permissionInDB = Object.assign(Object.assign({}, permissions_1.permissionsFixture[0]), { method: "nostr/signMessage/1" });
const message = {
    action: "signEvent",
    origin: { host: allowanceInDB.host },
    args: {
        event: {
            content: "sign short note",
            created_at: 1714716414,
            kind: 1,
            tags: [],
        },
    },
};
const sender = {
    documentId: "ALBY123",
    documentLifecycle: "active",
    id: "alby",
    origin: `https://${allowanceInDB.host}`,
    url: `https://${allowanceInDB.host}/test`,
};
const requestResponse = { data: MessageEvent };
const fullNostr = {
    signEvent: jest.fn(() => Promise.resolve(requestResponse.data)),
    getPublicKey: jest.fn(() => Promise.resolve(String)),
    getEventHash: jest.fn(() => Promise.resolve(String)),
};
// prepare DB with allowance
db_1.default.allowances.bulkAdd([allowanceInDB]);
// resets after every test
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.clearAllMocks();
    // ensure a clear permission table in DB
    yield db_1.default.permissions.clear();
    // set a default connector if overwritten in a previous test
    nostr = fullNostr;
}));
describe("signEvent", () => {
    describe("throws error", () => {
        test("if the host's allowance does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const senderWithUndefinedAllowanceHost = Object.assign(Object.assign({}, sender), { origin: `https://some-host.com` });
            const result = yield (0, signEventOrPrompt_1.default)(message, senderWithUndefinedAllowanceHost);
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(result).toStrictEqual({
                error: "Could not find an allowance for this host",
            });
        }));
    });
    describe("directly calls signEvent with method and params", () => {
        test("if permission for signEvent exists and is enabled", () => __awaiter(void 0, void 0, void 0, function* () {
            // prepare DB with matching permission
            yield db_1.default.permissions.bulkAdd([permissionInDB]);
            const result = yield (0, signEventOrPrompt_1.default)(message, sender);
            expect(result).toStrictEqual(requestResponse);
            expect(nostr.signEvent).toHaveBeenCalledWith(message.args.event);
            expect(utils_1.default.openPrompt).not.toHaveBeenCalled();
            expect(result).toStrictEqual(requestResponse);
        }));
    });
    describe("prompts the user first and then calls signEvent", () => {
        test("if the permission for signEvent does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            // prepare DB with other permission
            const otherPermission = Object.assign(Object.assign({}, permissionInDB), { method: "nostr/getPublicKey" });
            yield db_1.default.permissions.bulkAdd([otherPermission]);
            yield (0, signEventOrPrompt_1.default)(message, sender);
            expect(utils_1.default.openPrompt).toHaveBeenCalledWith({
                args: {
                    event: message.args.event,
                },
                origin: message.origin,
                action: "public/nostr/confirmSignMessage",
            });
        }));
    });
    describe("on the user's prompt response", () => {
        test("saves the permission if permissionOption is dont_ask_current", () => __awaiter(void 0, void 0, void 0, function* () {
            utils_1.default.openPrompt.mockResolvedValueOnce({
                data: {
                    permissionOption: types_1.PermissionOption.DONT_ASK_CURRENT,
                    blocked: false,
                    confirm: true,
                },
            });
            // prepare DB with a permission
            yield db_1.default.permissions.bulkAdd([
                Object.assign(Object.assign({}, permissionInDB), { method: "nostr/getPublicKey" }),
            ]);
            expect(yield db_1.default.permissions.toArray()).toHaveLength(1);
            expect(yield db_1.default.permissions.get({ method: "nostr/signMessage/1" })).toBeUndefined();
            const result = yield (0, signEventOrPrompt_1.default)(message, sender);
            expect(utils_1.default.openPrompt).toHaveBeenCalledTimes(1);
            expect(nostr.signEvent).toHaveBeenCalledWith(message.args.event);
            expect(yield db_1.default.permissions.toArray()).toHaveLength(2);
            const addedPermission = yield db_1.default.permissions.get({
                method: "nostr/signMessage/1",
            });
            expect(addedPermission).toEqual(expect.objectContaining({
                method: "nostr/signMessage/1",
                enabled: true,
                allowanceId: allowanceInDB.id,
                host: allowanceInDB.host,
                blocked: false,
            }));
            expect(result).toStrictEqual(requestResponse);
        }));
        test("doesn't call signEvent if clicks deny", () => __awaiter(void 0, void 0, void 0, function* () {
            // prepare DB with a permission
            yield db_1.default.permissions.bulkAdd([
                Object.assign(Object.assign({}, permissionInDB), { method: "nostr/getPublicKey" }),
            ]);
            expect(yield db_1.default.permissions.toArray()).toHaveLength(1);
            expect(yield db_1.default.permissions.get({ method: "nostr/signMessage/1" })).toBeUndefined();
            const result = yield (0, signEventOrPrompt_1.default)(message, sender);
            expect(utils_1.default.openPrompt).toHaveBeenCalledTimes(1);
            expect(nostr.signEvent).not.toHaveBeenCalled();
            expect(yield db_1.default.permissions.toArray()).toHaveLength(1);
            expect(yield db_1.default.permissions.get({ method: "nostr/signMessage/1" })).toBeUndefined();
            expect(result).toHaveProperty("error");
        }));
        test("does not save the permission if permissionOption is 'ASK_EVERYTIME'", () => __awaiter(void 0, void 0, void 0, function* () {
            utils_1.default.openPrompt.mockResolvedValueOnce({
                data: {
                    confirm: true,
                    blocked: false,
                    permissionOption: types_1.PermissionOption.ASK_EVERYTIME,
                },
            });
            // prepare DB with a permission
            yield db_1.default.permissions.bulkAdd([
                Object.assign(Object.assign({}, permissionInDB), { method: "nostr/getPublicKey" }),
            ]);
            expect(yield db_1.default.permissions.toArray()).toHaveLength(1);
            expect(yield db_1.default.permissions.get({ method: "nostr/signMessage/1" })).toBeUndefined();
            const result = yield (0, signEventOrPrompt_1.default)(message, sender);
            expect(utils_1.default.openPrompt).toHaveBeenCalledTimes(1);
            expect(nostr.signEvent).toHaveBeenCalledWith(message.args.event);
            expect(yield db_1.default.permissions.toArray()).toHaveLength(1);
            expect(yield db_1.default.permissions.get({ method: "nostr/signMessage/1" })).toBeUndefined();
            expect(result).toStrictEqual(requestResponse);
        }));
    });
});
