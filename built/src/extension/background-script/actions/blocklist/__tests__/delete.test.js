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
const blocklist_1 = require("~/fixtures/blocklist");
const delete_1 = __importDefault(require("../delete"));
const mockBlocklist = blocklist_1.blocklistFixture;
describe("delete from blocklist", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("removes blocked sites", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "deleteBlocklist",
            origin: {
                internal: true,
            },
            args: {
                host: "lnmarkets.com",
            },
        };
        yield db_1.default.blocklist.bulkAdd(mockBlocklist);
        expect(yield (0, delete_1.default)(message)).toStrictEqual({
            data: true,
        });
        const dbBlocklist = yield db_1.default.blocklist
            .toCollection()
            .reverse()
            .sortBy("id");
        expect(dbBlocklist).toEqual([
            {
                host: "getalby.com",
                id: 1,
                imageURL: "https://getalby.com/favicon.ico",
                isBlocked: true,
                name: "Alby: Your Bitcoin & Nostr companion for the web",
            },
        ]);
    }));
});
