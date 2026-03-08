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
const add_1 = __importDefault(require("../add"));
const mockBlocklist = [Object.assign({}, blocklist_1.blocklistFixture[0])];
describe("add to blocklist", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("add to blocklist", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "addBlocklist",
            origin: {
                internal: true,
            },
            args: {
                host: "lnmarkets.com",
                name: "LN Markets",
                imageURL: "https://lnmarkets.com/apple-touch-icon.png",
            },
        };
        yield db_1.default.blocklist.bulkAdd(mockBlocklist);
        yield (0, add_1.default)(message);
        const dbBlocklist = yield db_1.default.blocklist
            .toCollection()
            .reverse()
            .sortBy("id");
        expect(dbBlocklist).toContainEqual({
            host: "lnmarkets.com",
            id: 2,
            imageURL: "https://lnmarkets.com/apple-touch-icon.png",
            isBlocked: true,
            name: "LN Markets",
        });
    }));
});
