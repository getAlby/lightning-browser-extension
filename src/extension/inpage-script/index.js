import { ABORT_PROMPT_ERROR, USER_REJECTED_ERROR } from "~/common/constants";

import WebLNProvider from "../providers/webln";

if (document) {
  // window.webln is normally loaded onstart (see onstart.js)
  // this is just to make double sure we load it
  if (!window.webln) {
    window.webln = new WebLNProvider();
  }

  const readyEvent = new Event("webln:ready");
  window.dispatchEvent(readyEvent);

  // Intercept any `lightning:` requests
  window.addEventListener(
    "click",
    (ev) => {
      // Use composedPath() for detecting links inside a Shadow DOM
      // https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath
      const target = ev.composedPath()[0];

      if (!target || !target.closest) {
        return;
      }
      const lightningLink = target.closest('[href^="lightning:" i]');
      const lnurlLink = target.closest('[href^="lnurl" i]');
      const bitcoinLinkWithLighting = target.closest(
        '[href*="lightning=ln" i]'
      ); // links with a lightning parameter and a value that starts with ln: payment requests (lnbc...) or lnurl (lnurl*)
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

      window.webln.enable().then((response) => {
        if (!response.enabled) {
          return;
        }

        if (lnurl) {
          return window.webln
            .lnurl(lnurl)
            .catch((e) => {
              console.error(e);
              if (
                ![ABORT_PROMPT_ERROR, USER_REJECTED_ERROR].includes(e.message)
              ) {
                alert(`Error: ${e.message}`);
              }
            })
            .then((response) => {
              const responseEvent = new CustomEvent("lightning:success", {
                bubbles: true,
                detail: {
                  lnurl,
                  response,
                },
              });
              link.dispatchEvent(responseEvent);
            });
        }

        return window.webln
          .sendPayment(paymentRequest)
          .then((response) => {
            console.info(response);
            const responseEvent = new CustomEvent("lightning:success", {
              bubbles: true,
              detail: {
                paymentRequest,
                response,
              },
            });
            link.dispatchEvent(responseEvent);
          })
          .catch((e) => {
            console.error(e);
            if (
              ![ABORT_PROMPT_ERROR, USER_REJECTED_ERROR].includes(e.message)
            ) {
              alert(`Error: ${e.message}`);
            }
          });
      });
    },
    { capture: true }
  );
  // Listen for webln events from the extension
  // emit events to the websites
  window.addEventListener("message", (event) => {
    if (event.source === window && event.data.action === "accountChanged") {
      if (
        (window.webln && window.webln.enabled) ||
        (window.nostr && window.nostr.enabled)
      )
        eventEmitter(event.data.action, event.data.scope);
    }
  });
} else {
  console.warn("Failed to inject WebLN provider");
}

function eventEmitter(action, scope) {
  if (scope == "nostr") {
    window.nostr.emit(action);
  } else if (scope == "webln") {
    window.webln.emit(action);
  } else {
    return;
  }
}
