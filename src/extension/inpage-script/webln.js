import WebBTCProvider from "../ln/webbtc";
import WebLNProvider from "../ln/webln";

if (document) {
  window.webln = new WebLNProvider();
  window.webbtc = new WebBTCProvider();
}
