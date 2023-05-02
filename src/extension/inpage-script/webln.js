import WebBTCProvider from "../providers/webbtc";
import WebLNProvider from "../providers/webln";

if (document) {
  window.webln = new WebLNProvider();
  window.webbtc = new WebBTCProvider();
}
