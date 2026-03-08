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
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
const mv3_1 = require("~/common/utils/mv3");
const injectScript_1 = require("~/extension/content-script/injectScript");
function onstart() {
    return __awaiter(this, void 0, void 0, function* () {
        // Inject in-page scripts for MV2
        if (!mv3_1.isManifestV3) {
            // Try to inject inline
            (0, injectScript_1.injectScript)("@@@WINDOW_PROVIDER@@@");
            // Fallback if inline script is blocked via CSP
            (0, injectScript_1.injectScriptByUrl)(webextension_polyfill_1.default.runtime.getURL("js/inpageScript.bundle.js"));
        }
    });
}
onstart();
