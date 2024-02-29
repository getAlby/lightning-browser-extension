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
        href = lightningLink.getAttribute("href").toLowerCase();
        paymentRequest = href.replace("lightning:", "");
        link = lightningLink;
      } else if (bitcoinLinkWithLighting) {
        href = bitcoinLinkWithLighting.getAttribute("href").toLowerCase();
        link = bitcoinLinkWithLighting;
        const url = new URL(href);
        const query = new URLSearchParams(url.search);
        paymentRequest = query.get("lightning");
      } else if (lnurlLink) {
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
