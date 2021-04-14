import browser from "webextension-polyfill";
import { Lsat } from "lsat-js";
import qs from "query-string";
import utils from "../../../common/lib/utils";

let lsats = {};
let connector;

const injectLsatHeader = (requestDetails) => {
  const urlHash = requestDetails.url;
  const lsat = lsats[urlHash];
  if (lsat) {
    requestDetails.requestHeaders.push({
      name: "Authorization",
      value: lsat.token,
    });
    return { requestHeaders: requestDetails.requestHeaders };
  } else {
    return {};
  }
};

const processLsatAuthentication = (responseDetails) => {
  const urlHash = responseDetails.url;
  // reset lsat if we get a 401 response
  if (lsats[urlHash] && responseDetails.statusCode === 401) {
    lsats[urlHash] = null;
    return { redirectUrl: responseDetails.url };
  }
  // only process the response if it's the main_frame and the response status is 402
  if (responseDetails.statusCode !== 402) {
    return {};
  }
  // only process the response if we find a www-authenticate header
  const authHeader = responseDetails.responseHeaders.find((header) => {
    return header.name.toLowerCase() === "www-authenticate";
  });
  if (!authHeader) {
    return {};
  }
  const lsat = Lsat.fromHeader(authHeader.value);
  const urlParams = qs.stringify({
    lsat: authHeader.value,
    origin: JSON.stringify({ domain: responseDetails.url }),
    redirectUrl: responseDetails.url,
  });

  // NOTE: chrome does not support a Promise as a response here.
  // when do not run on Firefox we use the lsat.html redirect page to do the payment and redirect the user back to the requested URL.
  // sadly this does not work when loading media files or similar
  const lsatRedirectUrl = `${browser.runtime.getURL("lsat.html")}?${urlParams}`;
  if (!lsatRedirectUrl.startsWith("moz")) {
    return { redirectUrl: lsatRedirectUrl };
  } else {
    return connector
      .sendPayment({
        type: "sendPayment",
        args: { paymentRequest: lsat.invoice },
        origin: { domain: responseDetails.url, name: "", icon: "" },
      })
      .then((response) => {
        if (response.data && response.data.payment_hash) {
          let preimage = utils.base64ToHex(response.data.payment_preimage);
          //lsat.setPreimage(preimage);
          lsat.paymentPreimage = preimage;
          lsats[urlHash] = { token: lsat.toToken() };
          return browser.storage.sync.set({ lsats }).then(() => {
            return { redirectUrl: responseDetails.url };
          });
        }
      })
      .catch((e) => {
        console.log(e);
        return {};
      });
  }
};

async function initLsatInterceptor(_connector) {
  connector = _connector;
  browser.webRequest.onBeforeSendHeaders.removeListener(injectLsatHeader);
  browser.webRequest.onHeadersReceived.removeListener(
    processLsatAuthentication
  );

  // Cache current lsats
  // we can not call the browser storage everytime because of it's asnyc nature and it is better to do as little as possible in the request callbacks
  const result = await browser.storage.sync.get(["lsats"]);
  lsats = result.lsats;
  browser.storage.onChanged.addListener((changes) => {
    if (changes.lsats) {
      lsats = changes.lsats.newValue;
    }
  });

  browser.webRequest.onBeforeSendHeaders.addListener(
    injectLsatHeader,
    //{ urls: ["https://*/*"] },
    { urls: ["<all_urls>"] },
    ["blocking", "requestHeaders"]
  );

  browser.webRequest.onHeadersReceived.addListener(
    processLsatAuthentication,
    //{ urls: ["https://*/*"], types: ["main_frame"] },
    { urls: ["<all_urls>"] },
    ["blocking", "responseHeaders"]
  );
}

export default initLsatInterceptor;
