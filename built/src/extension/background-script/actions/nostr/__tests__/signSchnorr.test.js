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
const signSchnorrOrPrompt_1 = __importDefault(require("../signSchnorrOrPrompt"));
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
const permissionInDB = Object.assign(Object.assign({}, permissions_1.permissionsFixture[0]), { method: "nostr/signSchnorr" });
const message = {
    action: "signSchnorr",
    origin: { host: allowanceInDB.host },
    args: {
        sigHash: "sighash12345",
    },
};
const sender = {
    documentId: "ALBY123",
    documentLifecycle: "active",
    id: "alby",
    origin: `https://${allowanceInDB.host}`,
    url: `https://${allowanceInDB.host}/test`,
};
const requestResponse = { data: "" };
const fullNostr = {
    signSchnorr: jest.fn(() => Promise.resolve(requestResponse.data)),
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
describe("signSchnorr", () => {
    describe("throws error", () => {
        test("if the host's allowance does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const senderWithUndefinedAllowanceHost = Object.assign(Object.assign({}, sender), { origin: `https://some-host.com` });
            const result = yield (0, signSchnorrOrPrompt_1.default)(message, senderWithUndefinedAllowanceHost);
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(result).toStrictEqual({
                error: "Could not find an allowance for this host",
            });
        }));
        test("if the message args are not correct", () => __awaiter(void 0, void 0, void 0, function* () {
            const messageWithoutSigHash = Object.assign(Object.assign({}, message), { args: Object.assign(Object.assign({}, message.args), { sigHash: undefined }) });
            const result = yield (0, signSchnorrOrPrompt_1.default)(messageWithoutSigHash, sender);
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(result).toStrictEqual({
                error: "sigHash is missing or not correct",
            });
        }));
    });
    describe("directly calls signSchnorr with method and params", () => {
        test("if permission for signSchnorr exists and is enabled", () => __awaiter(void 0, void 0, void 0, function* () {
            // prepare DB with matching permission
            yield db_1.default.permissions.bulkAdd([permissionInDB]);
            const result = yield (0, signSchnorrOrPrompt_1.default)(message, sender);
            expect(result).toStrictEqual(requestResponse);
            expect(nostr.signSchnorr).toHaveBeenCalledWith(message.args.sigHash);
            expect(utils_1.default.openPrompt).not.toHaveBeenCalled();
            expect(result).toStrictEqual(requestResponse);
        }));
    });
    describe("prompts the user first and then calls signSchnorr", () => {
        test("if the permission for signSchnorr does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            // prepare DB with other permission
            const otherPermission = Object.assign(Object.assign({}, permissionInDB), { method: "nostr/getPublicKey" });
            yield db_1.default.permissions.bulkAdd([otherPermission]);
            yield (0, signSchnorrOrPrompt_1.default)(message, sender);
            expect(utils_1.default.openPrompt).toHaveBeenCalledWith({
                args: {
                    sigHash: message.args.sigHash,
                },
                origin: message.origin,
                action: "public/nostr/confirmSignSchnorr",
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
            expect(yield db_1.default.permissions.get({ method: "nostr/signSchnorr" })).toBeUndefined();
            const result = yield (0, signSchnorrOrPrompt_1.default)(message, sender);
            expect(utils_1.default.openPrompt).toHaveBeenCalledTimes(1);
            expect(nostr.signSchnorr).toHaveBeenCalledWith(message.args.sigHash);
            expect(yield db_1.default.permissions.toArray()).toHaveLength(2);
            const addedPermission = yield db_1.default.permissions.get({
                method: "nostr/signSchnorr",
            });
            expect(addedPermission).toEqual(expect.objectContaining({
                method: "nostr/signSchnorr",
                enabled: true,
                allowanceId: allowanceInDB.id,
                host: allowanceInDB.host,
                blocked: false,
            }));
            expect(result).toStrictEqual(requestResponse);
        }));
        test("doesn't call signSchnorr if clicks cancel", () => __awaiter(void 0, void 0, void 0, function* () {
            // prepare DB with a permission
            yield db_1.default.permissions.bulkAdd([
                Object.assign(Object.assign({}, permissionInDB), { method: "nostr/getPublicKey" }),
            ]);
            expect(yield db_1.default.permissions.toArray()).toHaveLength(1);
            expect(yield db_1.default.permissions.get({ method: "nostr/signSchnorr" })).toBeUndefined();
            const result = yield (0, signSchnorrOrPrompt_1.default)(message, sender);
            expect(utils_1.default.openPrompt).toHaveBeenCalledTimes(1);
            expect(nostr.signSchnorr).not.toHaveBeenCalled();
            expect(yield db_1.default.permissions.toArray()).toHaveLength(1);
            expect(yield db_1.default.permissions.get({ method: "nostr/signSchnorr" })).toBeUndefined();
            expect(result).toHaveProperty("error");
        }));
        test("does not save the permission if permissionOption is 'ASK_EVERYTIME'", () => __awaiter(void 0, void 0, void 0, function* () {
            utils_1.default.openPrompt.mockResolvedValueOnce({
                data: {
                    permissionOption: types_1.PermissionOption.ASK_EVERYTIME,
                    blocked: false,
                    confirm: true,
                },
            });
            // prepare DB with a permission
            yield db_1.default.permissions.bulkAdd([
                Object.assign(Object.assign({}, permissionInDB), { method: "nostr/getPublicKey" }),
            ]);
            expect(yield db_1.default.permissions.toArray()).toHaveLength(1);
            expect(yield db_1.default.permissions.get({ method: "nostr/signSchnorr" })).toBeUndefined();
            const result = yield (0, signSchnorrOrPrompt_1.default)(message, sender);
            expect(utils_1.default.openPrompt).toHaveBeenCalledTimes(1);
            expect(nostr.signSchnorr).toHaveBeenCalledWith(message.args.sigHash);
            expect(yield db_1.default.permissions.toArray()).toHaveLength(1);
            expect(yield db_1.default.permissions.get({ method: "nostr/signSchnorr" })).toBeUndefined();
            expect(result).toStrictEqual(requestResponse);
        }));
    });
});
