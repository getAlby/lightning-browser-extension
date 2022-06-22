import { ABORT_PROMPT_ERROR, USER_REJECTED_ERROR } from "~/common/constants";

import WebLNProvider from "../ln/webln";

if (document) {
  window.webln = new WebLNProvider();

  // Intercept any `lightning:` requests
  window.addEventListener("click", (ev) => {
    const target = ev.target;
    if (!target || !target.closest) {
      return;
    }
    const lightningLink = target.closest('[href^="lightning:" i]');
    const lnurlLink = target.closest('[href^="lnurl" i]');
    const bitcoinLinkWithLighting = target.closest('[href*="lightning=ln" i]'); // links with a lightning parameter and a value that starts with ln: payment requests (lnbc...) or lnurl (lnurl*)
    let href;
    let paymentRequest;
    let lnurl;

    if (!lightningLink && !bitcoinLinkWithLighting && !lnurlLink) {
      return;
    }
    ev.preventDefault();

    if (lightningLink) {
      href = lightningLink.getAttribute("href").toLowerCase();
      paymentRequest = href.replace("lightning:", "");
    } else if (bitcoinLinkWithLighting) {
      href = bitcoinLinkWithLighting.getAttribute("href");
      const url = new URL(href);
      const query = new URLSearchParams(url.search);
      paymentRequest = query.get("lightning");
    } else if (lnurlLink) {
      href = lnurlLink.getAttribute("href").toLowerCase();
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
        return window.webln.lnurl(lnurl).catch((e) => {
          console.error(e);
          alert(`Error: ${e.message}`);
        });
      }
      return window.webln
        .sendPayment(paymentRequest)
        .then((r) => {
          console.info(r);
        })
        .catch((e) => {
          console.error(e);
          if (![ABORT_PROMPT_ERROR, USER_REJECTED_ERROR].includes(e.message)) {
            alert(`Error: ${e.message}`);
          }
        });
    });
  });
} else {
  console.warn("Failed to inject WebLN provider");
}
