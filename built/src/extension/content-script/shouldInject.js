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
const msg_1 = __importDefault(require("../../common/lib/msg"));
const shouldInjectBrowserChecks_1 = require("../shouldInjectBrowserChecks");
// https://github.com/joule-labs/joule-extension/blob/develop/src/content_script/shouldInject.ts
// Whether or not to inject the WebLN listeners
function shouldInject() {
    return __awaiter(this, void 0, void 0, function* () {
        const notBlocked = yield blocklistCheck();
        const isHTML = (0, shouldInjectBrowserChecks_1.doctypeCheck)();
        const noProhibitedType = (0, shouldInjectBrowserChecks_1.suffixCheck)();
        const hasDocumentElement = (0, shouldInjectBrowserChecks_1.documentElementCheck)();
        return notBlocked && isHTML && noProhibitedType && hasDocumentElement;
    });
}
exports.default = shouldInject;
function blocklistCheck() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const currentHost = window.location.host;
            const blocklistData = yield msg_1.default.request("getBlocklist", {
                host: currentHost,
            });
            return !blocklistData.blocked; // return true if not blocked
        }
        catch (e) {
            if (e instanceof Error)
                console.error(e);
            return false;
        }
    });
}
