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
    const bitcoinLinkWithLighting = target.closest(
      '[href*="lightning=lnbc" i]'
    );
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
      const matches = href.match(/lightning=(\w+)/);
      if (!matches) {
        return;
      }
      paymentRequest = matches[1];
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
      lnurl = paymentRequest;
    }

    window.webln.enable().then((response) => {
      if (!response.enabled) {
        return;
      }
      if (lnurl) {
        return window.webln
          .lnurl(lnurl)
          .then((r) => {
            console.log(r);
          })
          .catch((e) => {
            console.log(e);
            alert(`Error: ${e.message}`);
          });
      }
      return window.webln
        .sendPayment(paymentRequest)
        .then((r) => {
          console.log(r);
          //alert(JSON.stringify(r));
        })
        .catch((e) => {
          console.log(e);
          alert(`Error: ${e.message}`);
        });
    });
  });
} else {
  console.warn("Failed to inject WebLN provider");
}
