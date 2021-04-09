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
    if (!lightningLink) {
      return;
    }
    ev.preventDefault();
    const href = lightningLink.getAttribute("href");
    const paymentRequest = href.replace("lightning:", "");
    window.webln.enable().then((response) => {
      if (!response.enabled) {
        return;
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
