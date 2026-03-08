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
const crypto_1 = require("~/common/lib/crypto");
const state_1 = __importDefault(require("~/extension/background-script/state"));
const i18nConfig_1 = __importDefault(require("~/i18n/i18nConfig"));
const unlock = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const passwordArg = message.args.password;
    const password = typeof passwordArg === "number" ? `${passwordArg}` : passwordArg;
    const account = state_1.default.getState().getAccount();
    const currentAccountId = state_1.default.getState().currentAccountId;
    if (!account) {
        console.error("No account configured");
        return Promise.resolve({ error: "No account configured" });
    }
    if (typeof account.config !== "string") {
        console.error("Config must be a string");
        return Promise.resolve({ error: "Config must be a string" });
    }
    try {
        (0, crypto_1.decryptData)(account.config, password);
    }
    catch (e) {
        console.error("Invalid password");
        return Promise.resolve({
            error: i18nConfig_1.default.t("translation:unlock.errors.invalid_password"),
        });
    }
    // if everything is fine we keep the password in memory
    yield state_1.default.getState().password(password);
    // load the connector to make sure it is initialized for the future calls
    // with this we prevent potentially multiple action calls trying to initialize the connector in parallel
    // we have to be careful here: if the unlock fails (e.g. because of an error in getConnector() the user
    // might be locked out of Alby and can not unlock and get to another account
    try {
        yield state_1.default.getState().getConnector();
    }
    catch (e) {
        // TODO: somehow notify the user that something is wrong with the connection
        console.error(e);
    }
    return { data: { unlocked: true, currentAccountId } };
});
exports.default = unlock;
