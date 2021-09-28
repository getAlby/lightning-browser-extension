import axios from "axios";
import sha256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";
import { parsePaymentRequest } from "invoices";

import { bech32Decode } from "../utils/helpers";

const fromInternetIdentifier = (address: string) => {
  // email regex: https://emailregex.com/
  if (
    address.match(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
  ) {
    const [name, host] = address.split("@");
    return `https://${host}/.well-known/lnurlp/${name}`;
  }
  return null;
};

const findLnurl = (text: string) => {
  let stringToText = text.trim();
  let match;
  // look for LNURL bech32 in the string
  match = stringToText.match(/(lnurl[a-zA-HJ-NP-Z0-9]+)/i);
  if (match) {
    return match[1];
  }

  // look for a LNURL with protocol scheme
  match = stringToText.match(/(lnurl([pwc])?:\/\/(\S+))/i);
  if (match) {
    return match[2];
  }
  return null;
};

const normalizeLnurl = (lnurlString: string) => {
  // maybe it's bech32 encoded?
  try {
    const url = bech32Decode(lnurlString);
    return new URL(url);
  } catch (e) {
    console.log("ignoring bech32 parsing error", e);
  }

  // maybe it's a lightning address?
  const urlFromAddress = fromInternetIdentifier(lnurlString);
  if (urlFromAddress) {
    return new URL(urlFromAddress);
  }

  //maybe it's already a URL?
  return new URL(`https://${lnurlString.replace(/^lnurl[pwc]/i, "")}`);
};

const lnurl = {
  async getDetails(lnurlString) {
    const url = normalizeLnurl(lnurlString);
    let lnurlDetails = {};
    lnurlDetails.tag = url.searchParams.get("tag");
    if (lnurlDetails.tag === "login") {
      lnurlDetails.k1 = url.searchParams.get("k1");
      lnurlDetails.action = url.searchParams.get("action");
    } else {
      const res = await axios.get(url.toString());
      lnurlDetails = res.data;
    }
    lnurlDetails.domain = url.hostname;
    lnurlDetails.url = url;
    return lnurlDetails;
  },
  verifyInvoice({ paymentInfo, metadata, amount }) {
    const paymentRequestDetails = parsePaymentRequest({
      request: paymentInfo.pr,
    });
    let metadataHash = "";
    try {
      metadataHash = sha256(metadata).toString(Hex);
    } catch (e) {
      console.log(e.message);
    }
    switch (true) {
      case paymentRequestDetails.description_hash !== metadataHash: // LN WALLET Verifies that h tag (description_hash) in provided invoice is a hash of metadata string converted to byte array in UTF-8 encoding
      case paymentRequestDetails.mtokens !== String(amount): // LN WALLET Verifies that amount in provided invoice equals an amount previously specified by user
      case paymentInfo.successAction &&
        !["url", "message", "aes"].includes(paymentInfo.successAction.tag): // If successAction is not null: LN WALLET makes sure that tag value of is of supported type, aborts a payment otherwise
        return false;
      default:
        return true;
    }
  },
};

export default lnurl;
