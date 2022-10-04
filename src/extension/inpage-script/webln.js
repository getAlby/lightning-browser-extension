import WebLNProvider from "../ln/webln";
import WebBTCProvider from "../webbtc";

if (document) {
  window.webln = new WebLNProvider();
  window.webbtc = new WebBTCProvider();
}
