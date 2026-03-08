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
const constants_1 = require("~/common/constants");
const alby_1 = __importDefault(require("~/extension/providers/alby"));
const liquid_1 = __importDefault(require("~/extension/providers/liquid"));
const nostr_1 = __importDefault(require("~/extension/providers/nostr"));
const webbtc_1 = __importDefault(require("~/extension/providers/webbtc"));
const webln_1 = __importDefault(require("~/extension/providers/webln"));
const shouldInject_1 = __importDefault(require("./shouldInject"));
function init() {
    const inject = (0, shouldInject_1.default)();
    if (!inject)
        return;
    window.liquid = new liquid_1.default();
    window.nostr = new nostr_1.default();
    window.webbtc = new webbtc_1.default();
    window.webln = new webln_1.default();
    window.alby = new alby_1.default();
    const readyEvent = new Event("webln:ready");
    window.dispatchEvent(readyEvent);
    registerLightningLinkClickHandler();
    // Listen for webln events from the extension
    // emit events to the websites
    window.addEventListener("message", (event) => {
        if (event.source === window && event.data.action === "accountChanged") {
            eventEmitter(event.data.action, event.data.scope);
        }
    });
}
function registerLightningLinkClickHandler() {
    // Intercept any `lightning:` requests
    window.addEventListener("click", (ev) => __awaiter(this, void 0, void 0, function* () {
        // Use composedPath() for detecting links inside a Shadow DOM
        // https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath
        const target = ev.composedPath()[0];
        if (!target || !target.closest) {
            return;
        }
        // parse protocol schemes defined in LUD-17
        // https://github.com/lnurl/luds/blob/luds/17.md
        const lightningLink = target.closest('[href^="lightning:" i]');
        const lnurlLink = target.closest('[href^="lnurlp:" i],[href^="lnurlw:" i],[href^="lnurlc:" i]');
        const bitcoinLinkWithLighting = target.closest('[href*="lightning=ln" i]'); // links with a lightning parameter and a value that starts with ln: payment requests (lnbc...) or lnurl (lnurl[pwc]:)
        let href;
        let paymentRequest;
        let lnurl;
        let link; // used to dispatch a succcess event
        if (!lightningLink && !bitcoinLinkWithLighting && !lnurlLink) {
            return;
        }
        ev.preventDefault();
        if (lightningLink) {
            href = lightningLink.getAttribute("href").toLowerCase();
            paymentRequest = href.replace("lightning:", "");
            link = lightningLink;
        }
        else if (bitcoinLinkWithLighting) {
            href = bitcoinLinkWithLighting.getAttribute("href").toLowerCase();
            link = bitcoinLinkWithLighting;
            const url = new URL(href);
            const query = new URLSearchParams(url.search);
            paymentRequest = query.get("lightning");
        }
        else if (lnurlLink) {
            href = lnurlLink.getAttribute("href").toLowerCase();
            link = lnurlLink;
            lnurl = href.replace(/^lnurl[pwc]:/i, "");
        }
        // if we did not find any paymentRequest and no LNURL we give up and return
        if (!paymentRequest && !lnurl) {
            return;
        }
        // it could be it is a LNURL behind a lightning: link
        if (paymentRequest && paymentRequest.startsWith("lnurl")) {
            lnurl = paymentRequest.replace(/^lnurl[pwc]:/i, ""); // replace potential scheme. the different lnurl types are handled in the lnurl action (by checking the type in the LNURL response)
        }
        // it could be a lightning address behind a lightning: link
        if (paymentRequest && paymentRequest.match(/(\S+@\S+)/)) {
            lnurl = paymentRequest.match(/(\S+@\S+)/)[1];
        }
        try {
            yield window.webln.enable();
        }
        catch (e) {
            console.error(e);
        }
        if (lnurl) {
            try {
                const response = yield window.webln.lnurl(lnurl);
                const responseEvent = new CustomEvent("lightning:success", {
                    bubbles: true,
                    detail: {
                        lnurl,
                        response,
                    },
                });
                link.dispatchEvent(responseEvent);
            }
            catch (e) {
                console.error(e);
                if (![constants_1.ABORT_PROMPT_ERROR, constants_1.USER_REJECTED_ERROR].includes(e.message)) {
                    alert(`Error: ${e.message}`);
                }
            }
        }
        try {
            const response = yield window.webln.sendPayment(paymentRequest);
            const responseEvent = new CustomEvent("lightning:success", {
                bubbles: true,
                detail: {
                    paymentRequest,
                    response,
                },
            });
            link.dispatchEvent(responseEvent);
        }
        catch (e) {
            console.error(e);
            if (![constants_1.ABORT_PROMPT_ERROR, constants_1.USER_REJECTED_ERROR].includes(e.message)) {
                alert(`Error: ${e.message}`);
            }
        }
    }), { capture: true });
}
function eventEmitter(action, scope) {
    if (window[scope] && window[scope].emit) {
        window[scope].emit(action);
    }
}
init();
