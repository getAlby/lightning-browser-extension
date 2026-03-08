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
const connectPeer_1 = __importDefault(require("../connectPeer"));
jest.mock("~/extension/background-script/state");
const connectPeerMock = jest.fn().mockResolvedValue({ data: true });
const mockState = {
    getConnector: () => ({
        connectPeer: connectPeerMock,
    }),
};
const message = {
    application: "LBE",
    prompt: true,
    action: "connectPeer",
    args: {
        host: "34.68.41.206:9735",
        pubkey: "03037dc08e9ac63b82581f79b662a4d0ceca8a8ca162b1af3551595b8f2d97b70a",
    },
    origin: {
        internal: true,
    },
};
describe("open connectPeer", () => {
    test("types", () => __awaiter(void 0, void 0, void 0, function* () {
        state_1.default.getState = jest.fn().mockReturnValue(mockState);
        yield (0, connectPeer_1.default)(message);
        expect(connectPeerMock).toHaveBeenCalledWith({
            host: "34.68.41.206:9735",
            pubkey: "03037dc08e9ac63b82581f79b662a4d0ceca8a8ca162b1af3551595b8f2d97b70a",
        });
    }));
});
