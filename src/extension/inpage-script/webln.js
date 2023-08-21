import WebLNProvider from "../providers/webln";

if (document) {
  window.webln = new WebLNProvider();

  const readyEvent = new Event("webln:ready");
  window.dispatchEvent(readyEvent);
}
