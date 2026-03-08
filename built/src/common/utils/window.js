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
exports.createPromptTab = exports.createPromptWindow = void 0;
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
function createPromptWindow(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const windowWidth = 400;
        const windowHeight = 600;
        const { top, left } = yield getPosition(windowWidth, windowHeight);
        const popupOptions = {
            url: url,
            type: "popup",
            width: windowWidth,
            height: windowHeight,
            top: top,
            left: left,
        };
        const result = yield webextension_polyfill_1.default.windows.create(popupOptions);
        return result.tabs && result.tabs[0].id;
    });
}
exports.createPromptWindow = createPromptWindow;
function createPromptTab(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const tabOptions = {
            url: url,
        };
        const result = yield webextension_polyfill_1.default.tabs.create(tabOptions);
        return result.id;
    });
}
exports.createPromptTab = createPromptTab;
function getPosition(width, height) {
    return __awaiter(this, void 0, void 0, function* () {
        let left = 0;
        let top = 0;
        try {
            const lastFocused = yield webextension_polyfill_1.default.windows.getLastFocused();
            if (lastFocused &&
                lastFocused.top != undefined &&
                lastFocused.left != undefined &&
                lastFocused.width != undefined &&
                lastFocused.height != undefined) {
                // Position window in the center of the lastFocused window
                // Rounding for integer values (px)
                top = Math.round(lastFocused.top + (lastFocused.height - height) / 2);
                left = Math.round(lastFocused.left + (lastFocused.width - width) / 2);
            }
        }
        catch (_) {
            // The following properties are more than likely 0, due to being
            // opened from the background chrome process for the extension that
            // has no physical dimensions
            const { screenX, screenY, outerWidth } = window;
            top = Math.max(screenY, 0);
            left = Math.max(screenX + (outerWidth - width), 0);
        }
        return {
            top,
            left,
        };
    });
}
