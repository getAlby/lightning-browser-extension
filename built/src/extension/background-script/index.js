"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const utils_1 = __importDefault(require("~/common/lib/utils"));
const mv3_1 = require("~/common/utils/mv3");
const os_1 = __importDefault(require("~/common/utils/os"));
const registerContentScript_1 = require("~/extension/background-script/registerContentScript");
const setIcon_1 = require("./actions/setup/setIcon");
const db_1 = require("./db");
const events = __importStar(require("./events"));
const migrations_1 = __importDefault(require("./migrations"));
const router_1 = require("./router");
const state_1 = __importDefault(require("./state"));
let isFirstInstalled = false;
let isRecentlyUpdated = false;
const { promise: isInitialized, resolve: resolveInit, reject: rejectInit, } = utils_1.default.deferredPromise();
const debug = process.env.NODE_ENV === "development";
/* debug help to check the current state
setInterval(() => {
  console.log(state.getState());
}, 5000);
*/
const extractLightningData = (tabId, changeInfo, tabInfo) => {
    var _a;
    if (changeInfo.status === "complete" && ((_a = tabInfo.url) === null || _a === void 0 ? void 0 : _a.startsWith("http"))) {
        // Adding a short delay because I've seen cases where this call has happened too fast
        // before the receiving side in the content-script was connected/listening
        setTimeout(() => {
            // double check: https://developer.chrome.com/docs/extensions/mv3/migrating_to_service_workers/#alarms
            webextension_polyfill_1.default.tabs.sendMessage(tabId, {
                action: "extractLightningData",
            });
        }, 150);
    }
};
const updateIcon = (tabId, changeInfo, tabInfo) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (changeInfo.status !== "complete" || !((_a = tabInfo.url) === null || _a === void 0 ? void 0 : _a.startsWith("http"))) {
        return;
    }
    const url = new URL(tabInfo.url);
    const allowance = yield db_1.db.allowances
        .where("host")
        .equalsIgnoreCase(url.host)
        .first();
    yield (0, setIcon_1.setIcon)(allowance ? setIcon_1.ExtensionIcon.Active : setIcon_1.ExtensionIcon.Default, tabId);
});
const debugLogger = (message, sender) => {
    if (debug) {
        console.info("Background onMessage: ", message, sender);
    }
};
const handleInstalled = (details) => {
    console.info(`Handle installed: ${details.reason}`);
    // TODO: maybe check if accounts are already configured?
    if (details.reason === "install") {
        isFirstInstalled = true;
    }
    if (details.reason === "update") {
        console.info("Alby was recently updated");
        isRecentlyUpdated = true;
    }
};
// listen to calls from the content script and calls the actions through the router
// returns a promise to be handled in the content script
const routeCalls = (message, sender) => __awaiter(void 0, void 0, void 0, function* () {
    // if the application does not match or if it is not a prompt we ignore the call
    if (message.application !== "LBE" || !message.prompt) {
        return;
    }
    if (message.type) {
        console.error("Invalid message, using type: ", message);
    }
    yield isInitialized;
    const action = message.action || message.type;
    console.info(`Routing call: ${action}`);
    // Potentially check for internal vs. public calls
    const call = (0, router_1.router)(action)(message, sender);
    // Log the action response if we are in debug mode
    if (debug) {
        call.then((r) => {
            console.info(`${action} response:`, r);
            return r;
        });
    }
    const result = yield call;
    return result;
});
webextension_polyfill_1.default.runtime.onMessage.addListener(debugLogger);
// this is the only handler that may and must return a Promise which resolve with the response to the content script
webextension_polyfill_1.default.runtime.onMessage.addListener(routeCalls);
// Update the extension icon
webextension_polyfill_1.default.tabs.onUpdated.addListener(updateIcon);
// Notify the content script that the tab has been updated.
webextension_polyfill_1.default.tabs.onUpdated.addListener(extractLightningData);
// The onInstalled event is fired directly after the code is loaded.
// When we subscribe to that event asynchronously in the init() function it is too late and we miss the event.
webextension_polyfill_1.default.runtime.onInstalled.addListener(handleInstalled);
// CONTEXT MENU CODE START
let contextMenuCreated = false;
const isAndroid = (0, os_1.default)() === "Android";
// Adds or removes the context menu item based on validation result.
function updateMenu(shouldShow) {
    if (shouldShow && !contextMenuCreated) {
        webextension_polyfill_1.default.contextMenus.create({
            id: "btc-lightning-pay",
            title: "Pay with Bitcoin or Lightning",
            contexts: ["selection"],
        });
        contextMenuCreated = true;
    }
    else if (!shouldShow && contextMenuCreated) {
        webextension_polyfill_1.default.contextMenus.remove("btc-lightning-pay");
        contextMenuCreated = false;
    }
}
if (!isAndroid) {
    // Listen for messages from content script
    webextension_polyfill_1.default.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === "updateContextMenu") {
            updateMenu(request.isValid);
        }
    });
    // Handle menu clicks
    webextension_polyfill_1.default.contextMenus.onClicked.addListener((info, tab) => {
        var _a;
        const text = (_a = info === null || info === void 0 ? void 0 : info.selectionText) === null || _a === void 0 ? void 0 : _a.trim();
        if (!text)
            return;
        if (info.menuItemId === "btc-lightning-pay") {
            const sendUrl = webextension_polyfill_1.default.runtime.getURL(`popup.html?invoice=${encodeURIComponent(text)}#/send`);
            webextension_polyfill_1.default.windows.create({
                url: sendUrl,
                type: "popup",
                width: 400,
                height: 650,
            });
        }
    });
    // Clean up on startup
    webextension_polyfill_1.default.runtime.onStartup.addListener(() => {
        webextension_polyfill_1.default.contextMenus.removeAll();
        contextMenuCreated = false;
    });
}
// CONTEXT MENU CODE END
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        console.info("Loading background script");
        if (mv3_1.isManifestV3)
            (0, registerContentScript_1.registerInPageContentScript)();
        yield state_1.default.getState().init();
        console.info("State loaded");
        const dbAvailable = yield (0, db_1.isIndexedDbAvailable)();
        if (dbAvailable) {
            console.info("Using indexedDB");
            yield db_1.db.open();
        }
        else {
            console.info("Using in memory DB");
            yield db_1.db.openWithInMemoryDB();
        }
        console.info("DB opened");
        events.subscribe();
        console.info("Events subscribed");
        if (isRecentlyUpdated) {
            console.info("Running any pending migrations");
            yield (0, migrations_1.default)();
        }
        console.info("Loading completed");
    });
}
console.info("Welcome to Alby");
init()
    .then(() => {
    if (resolveInit) {
        resolveInit();
    }
    if (isFirstInstalled && !state_1.default.getState().getAccount()) {
        utils_1.default.openUrl("welcome.html");
    }
})
    .catch((err) => {
    console.error(err);
    if (rejectInit) {
        rejectInit();
    }
});
webextension_polyfill_1.default.runtime.setUninstallURL("https://getalby.com/goodbye");
