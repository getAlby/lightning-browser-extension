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
const state_1 = __importDefault(require("~/extension/background-script/state"));
const select = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const currentState = state_1.default.getState();
    const accountId = message.args.id;
    const account = currentState.accounts[accountId];
    if (account) {
        if (currentState.connector) {
            console.info("Unloading connector");
            const connector = yield currentState.connector;
            yield connector.unload();
        }
        state_1.default.setState({
            account,
            nostr: null,
            liquid: null,
            mnemonic: null,
            bitcoin: null,
            connector: null,
            currentAccountId: accountId,
        });
        // init connector this also memoizes the connector in the state object
        yield state_1.default.getState().getConnector();
        // save the current account id once the connector is loaded
        yield state_1.default.getState().saveToStorage();
        yield notifyAccountChanged();
        return {
            data: { unlocked: true },
        };
    }
    else {
        console.error(`Account not found: ${accountId}`);
        return {
            error: `Account not found: ${accountId}`,
        };
    }
});
exports.default = select;
// Send a notification message to the content script
// which will then be posted to the window so websites can sync with the switched account
function notifyAccountChanged() {
    return __awaiter(this, void 0, void 0, function* () {
        const tabs = yield webextension_polyfill_1.default.tabs.query({});
        // Send message to tabs with URLs starting with "http" or "https"
        if (tabs) {
            const validTabs = tabs.filter((tab) => {
                const currentUrl = tab.url || "";
                return currentUrl.startsWith("http") || currentUrl.startsWith("https");
            });
            for (const tab of validTabs) {
                try {
                    if (tab.id) {
                        yield webextension_polyfill_1.default.tabs.sendMessage(tab.id, { action: "accountChanged" });
                    }
                }
                catch (error) {
                    console.error("Failed to notify account changed", error);
                }
            }
        }
    });
}
