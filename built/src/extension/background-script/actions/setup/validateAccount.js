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
const connectors_1 = __importDefault(require("../../connectors"));
const validateAccount = (message, sender) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const account = message.args;
    const connector = new connectors_1.default[account.connector](account, account.config);
    yield connector.init();
    try {
        const info = yield connector.getInfo();
        yield connector.unload(); // unload the connector again, we just checked if it works but have no persistence
        return {
            data: {
                valid: true,
                info: info,
                oAuthToken: (_a = connector.getOAuthToken) === null || _a === void 0 ? void 0 : _a.call(connector),
            },
        };
    }
    catch (e) {
        console.error(e);
        return { data: { valid: false, error: e.message } };
    }
});
exports.default = validateAccount;
