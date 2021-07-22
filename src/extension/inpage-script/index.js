import WebLNProvider from "../ln/webln";
import Donation from "./donation";

if (document) {
  window.webln = new WebLNProvider();

  const donation = new Donation(document.location.toString());
  donation.execute();

  // Intercept any `lightning:{paymentReqest}` requests
  window.addEventListener("click", (ev) => {
    const target = ev.target;
    if (!target || !target.closest) {
      return;
    }
    const lightningLink = target.closest('[href^="lightning:"]');
    const bitcoinLinkWithLighting = target.closest('[href*="lightning=lnbc"]');
    let href;
    let paymentRequest;

    if (!lightningLink && !bitcoinLinkWithLighting) {
      return;
    }
    ev.preventDefault();

    if (lightningLink) {
      href = lightningLink.getAttribute("href");
      paymentRequest = href.replace("lightning:", "");
    } else if (bitcoinLinkWithLighting) {
      href = bitcoinLinkWithLighting.getAttribute("href");
      const matches = href.match(/lightning=(\w+)/);
      if (!matches) {
        return;
      }
      paymentRequest = matches[0];
    }
    if (!paymentRequest) {
      return;
    }

    window.webln.enable().then((response) => {
      if (!response.enabled) {
        return;
      }
      if (paymentRequest.toLowerCase().startsWith("lnurl")) {
        return window.webln
          .lnurl(paymentRequest)
          .then((r) => {
            alert(JSON.stringify(r));
          })
          .catch((e) => {
            console.log(e);
            alert(`Error: ${e.message}`);
          });
      }
      return window.webln
        .sendPayment(paymentRequest)
        .then((r) => {
          alert(JSON.stringify(r));
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
