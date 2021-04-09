import browser from "webextension-polyfill";
import qs from "query-string";
import { Lsat } from "lsat-js";
import utils from "../../../common/lib/utils";

(async function run() {
  const message = qs.parse(window.location.search);

  const origin = JSON.parse(message.origin);
  console.log(message);
  const lsat = Lsat.fromHeader(message.lsat);

  const result = await browser.storage.sync.get(["lsats"]);
  const lsats = result.lsats || {};

  const urlHash = message.redirectUrl;

  utils
    .call("sendPayment", { paymentRequest: lsat.invoice }, { origin })
    .then((response) => {
      console.log(response);
      if (response && response.payment_hash) {
        let preimage = utils.base64ToHex(response.payment_preimage);
        lsat.paymentPreimage = preimage;
        console.log(lsat.toToken());
        lsats[urlHash] = { token: lsat.toToken() };
        console.log({ lsats });
        return browser.storage.sync.set({ lsats }).then(() => {
          document.location = message.redirectUrl;
        });
      }
    })
    .catch((e) => {
      console.log(e);
      alert("Failed");
      //document.location = message.redirectUrl;
    });
})();
