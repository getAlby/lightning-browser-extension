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
exports.withdrawWithPrompt = exports.payWithPrompt = exports.authOrPrompt = exports.auth = void 0;
const lnurl_1 = __importDefault(require("~/common/lib/lnurl"));
const typeHelpers_1 = require("~/common/utils/typeHelpers");
const auth_1 = __importDefault(require("./auth"));
exports.auth = auth_1.default;
const authOrPrompt_1 = __importDefault(require("./authOrPrompt"));
exports.authOrPrompt = authOrPrompt_1.default;
const channel_1 = __importDefault(require("./channel"));
const pay_1 = __importDefault(require("./pay"));
exports.payWithPrompt = pay_1.default;
const withdraw_1 = __importDefault(require("./withdraw"));
exports.withdrawWithPrompt = withdraw_1.default;
/*
  Main entry point for LNURL calls
  returns a messagable response: an object with either a `data` or with an `error`
*/
function lnurl(message, sender) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof message.args.lnurlEncoded !== "string")
            return;
        let lnurlDetails;
        try {
            lnurlDetails = yield lnurl_1.default.getDetails(message.args.lnurlEncoded);
            if ((0, typeHelpers_1.isLNURLDetailsError)(lnurlDetails)) {
                return { error: lnurlDetails.reason };
            }
        }
        catch (e) {
            return { error: e instanceof Error ? e.message : "Failed to parse LNURL" };
        }
        switch (lnurlDetails.tag) {
            case "channelRequest":
                return (0, channel_1.default)(message, lnurlDetails);
            case "login":
                return (0, authOrPrompt_1.default)(message, sender, lnurlDetails);
            case "payRequest":
                return (0, pay_1.default)(message, lnurlDetails);
            case "withdrawRequest":
                return (0, withdraw_1.default)(message, lnurlDetails);
            default:
                return { error: "not implemented" };
        }
    });
}
exports.default = lnurl;
