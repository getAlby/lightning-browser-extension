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
const api_1 = __importDefault(require("~/common/lib/api"));
const Monetization_1 = __importDefault(require("./Monetization"));
const Reddit_1 = __importDefault(require("./Reddit"));
const Mastodon_1 = __importDefault(require("./Mastodon"));
const Medium_1 = __importDefault(require("./Medium"));
// Order is important as the first one for which the URL matches will be used
const enhancements = [Monetization_1.default, Reddit_1.default, Mastodon_1.default, Medium_1.default];
function extractLightningData() {
    return __awaiter(this, void 0, void 0, function* () {
        const settings = yield api_1.default.getSettings();
        if (!settings.websiteEnhancements)
            return;
        const match = enhancements.find((e) => document.location.toString().match(e.urlMatcher));
        if (match) {
            match.battery();
        }
    });
}
exports.default = extractLightningData;
