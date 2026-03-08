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
const permissions_1 = require("~/fixtures/permissions");
const deleteByIds_1 = __importDefault(require("../deleteByIds"));
const mockNow = 1487076708000;
Date.now = jest.fn(() => mockNow);
const mockPermissions = permissions_1.permissionsFixture;
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    // fill the DB first
    yield db_1.default.permissions.bulkAdd(mockPermissions);
}));
afterEach(() => {
    jest.clearAllMocks();
});
describe("delete permissions by id", () => {
    test("bulk deletes permissions using keys", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "deletePermissions",
            origin: {
                internal: true,
            },
            args: {
                ids: [2, 3],
                accountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
            },
        };
        yield (0, deleteByIds_1.default)(message);
        const dbPermissions = yield db_1.default.permissions.toArray();
        expect(dbPermissions).toStrictEqual([mockPermissions[0]]);
    }));
});
