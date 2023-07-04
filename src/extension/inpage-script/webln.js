import WebLNProvider from "../providers/webln";

if (document) {
  window.webln = new WebLNProvider();
}
