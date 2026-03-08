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
const get_1 = __importDefault(require("../get"));
const mockBlocklist = blocklist_1.blocklistFixture;
describe("get blocked site", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("get blocked site", () => __awaiter(void 0, void 0, void 0, function* () {
        const message = {
            application: "LBE",
            prompt: true,
            action: "getBlocklist",
            origin: {
                internal: true,
            },
            args: {
                host: "getalby.com",
            },
        };
        yield db_1.default.blocklist.bulkAdd(mockBlocklist);
        expect(yield (0, get_1.default)(message)).toStrictEqual({
            data: { blocked: true },
        });
    }));
});
