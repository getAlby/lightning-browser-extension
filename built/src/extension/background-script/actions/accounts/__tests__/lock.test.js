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
const lock_1 = __importDefault(require("../lock"));
jest.mock("~/extension/background-script/state");
const mockState = {
    lock: jest.fn,
};
const message = {
    application: "LBE",
    origin: { internal: true },
    prompt: true,
    action: "lock",
};
describe("lock extension", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("lock", () => __awaiter(void 0, void 0, void 0, function* () {
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        const spy = jest.spyOn(mockState, "lock");
        expect(yield (0, lock_1.default)(message)).toStrictEqual({
            data: { unlocked: false },
        });
        expect(spy).toHaveBeenCalledTimes(1);
    }));
});
