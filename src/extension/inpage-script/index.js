import { ABORT_PROMPT_ERROR, USER_REJECTED_ERROR } from "~/common/constants";
import AlbyProvider from "~/extension/providers/alby";
import LiquidProvider from "~/extension/providers/liquid";
import NostrProvider from "~/extension/providers/nostr";
import WebBTCProvider from "~/extension/providers/webbtc";
import WebLNProvider from "~/extension/providers/webln";
import shouldInjectInpage from "./shouldInject";

function init() {
  const inject = shouldInjectInpage();
  if (!inject) return;
  window.liquid = new LiquidProvider();
  window.nostr = new NostrProvider();
  window.webbtc = new WebBTCProvider();
  window.webln = new WebLNProvider();
  window.alby = new AlbyProvider();
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
// BOLT11 invoices and bech32-encoded LNURLs are case-insensitive, but mixed
// case is not valid bech32 — normalize those to lowercase. Anything else is
// left untouched: LUD-17 URLs (lnurlp:, lnurlw:, lnurlc:) and lightning
// addresses carry a case-sensitive path, query, and username, so lowercasing
// them would send the request to a different endpoint than the link points to.
// The charset of a bech32 payload cannot contain a scheme separator, a slash,
// a dot or an @, which is what tells the two apart here.
function normalizeBech32(value) {
  return /^ln[a-z0-9]+$/i.test(value) ? value.toLowerCase() : value;
}

function registerLightningLinkClickHandler() {
  // Intercept any `lightning:` requests
  window.addEventListener(
    "click",
    async (ev) => {
      // Use composedPath() for detecting links inside a Shadow DOM
      // https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath
      const target = ev.composedPath()[0];

      if (!target || !target.closest) {
        return;
      }
      // parse protocol schemes defined in LUD-17
      // https://github.com/lnurl/luds/blob/luds/17.md
      const lightningLink = target.closest('[href^="lightning:" i]');
      const lnurlLink = target.closest(
        '[href^="lnurlp:" i],[href^="lnurlw:" i],[href^="lnurlc:" i]'
      );
      const bitcoinLinkWithLighting = target.closest(
        '[href*="lightning=ln" i]'
      ); // links with a lightning parameter and a value that starts with ln: payment requests (lnbc...) or lnurl (lnurl[pwc]:)
      let href;
      let paymentRequest;
      let lnurl;
      let link; // used to dispatch a succcess event

      if (!lightningLink && !bitcoinLinkWithLighting && !lnurlLink) {
        return;
      }
      ev.preventDefault();

      if (lightningLink) {
        href = lightningLink.getAttribute("href");
        paymentRequest = normalizeBech32(href.replace(/^lightning:/i, ""));
        link = lightningLink;
      } else if (bitcoinLinkWithLighting) {
        href = bitcoinLinkWithLighting.getAttribute("href");
        link = bitcoinLinkWithLighting;
        const url = new URL(href);
        const query = new URLSearchParams(url.search);
        // the selector matches the parameter name case-insensitively, so the
        // lookup has to as well
        const lightningParam = Array.from(query).find(
          ([key]) => key.toLowerCase() === "lightning"
        );
        paymentRequest = lightningParam && normalizeBech32(lightningParam[1]);
      } else if (lnurlLink) {
        href = lnurlLink.getAttribute("href");
        link = lnurlLink;
        lnurl = href.replace(/^lnurl[pwc]:/i, "");
      }

      // if we did not find any paymentRequest and no LNURL we give up and return
      if (!paymentRequest && !lnurl) {
        return;
      }

      // it could be it is a LNURL behind a lightning: link
      if (paymentRequest && /^lnurl/i.test(paymentRequest)) {
        lnurl = paymentRequest.replace(/^lnurl[pwc]:/i, ""); // replace potential scheme. the different lnurl types are handled in the lnurl action (by checking the type in the LNURL response)
      }
      // it could be a lightning address behind a lightning: link
      if (paymentRequest && paymentRequest.match(/(\S+@\S+)/)) {
        lnurl = paymentRequest.match(/(\S+@\S+)/)[1];
      }

      try {
        await window.webln.enable();
      } catch (e) {
        console.error(e);
      }

      if (lnurl) {
        try {
          const response = await window.webln.lnurl(lnurl);
          const responseEvent = new CustomEvent("lightning:success", {
            bubbles: true,
            detail: {
              lnurl,
              response,
            },
          });
          link.dispatchEvent(responseEvent);
        } catch (e) {
          console.error(e);
          if (![ABORT_PROMPT_ERROR, USER_REJECTED_ERROR].includes(e.message)) {
            alert(`Error: ${e.message}`);
          }
        }
      }

      try {
        const response = await window.webln.sendPayment(paymentRequest);
        const responseEvent = new CustomEvent("lightning:success", {
          bubbles: true,
          detail: {
            paymentRequest,
            response,
          },
        });
        link.dispatchEvent(responseEvent);
      } catch (e) {
        console.error(e);
        if (![ABORT_PROMPT_ERROR, USER_REJECTED_ERROR].includes(e.message)) {
          alert(`Error: ${e.message}`);
        }
      }
    },
    { capture: true }
  );
}
function eventEmitter(action, scope) {
  if (window[scope] && window[scope].emit) {
    window[scope].emit(action);
  }
}
init();
