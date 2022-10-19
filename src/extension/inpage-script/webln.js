import * as alby from "alby-tools";

import WebLNProvider from "../ln/webln";

if (document) {
  window.webln = new WebLNProvider();
  window.alby = alby;
}
