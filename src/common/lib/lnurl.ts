import axios from "axios";
import sha256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";
import { parsePaymentRequest } from "invoices";

import { bech32Decode } from "../utils/helpers";

const lnurl = {
  async getDetails(lnurlEncoded) {
    const lnurlDecoded = bech32Decode(lnurlEncoded);
    const url = new URL(lnurlDecoded);
    let lnurlDetails = {};
    lnurlDetails.tag = url.searchParams.get("tag");
    if (lnurlDetails.tag === "login") {
      lnurlDetails.k1 = url.searchParams.get("k1");
      lnurlDetails.action = url.searchParams.get("action");
    } else {
      const res = await axios.get(lnurlDecoded);
      lnurlDetails = res.data;
    }
    lnurlDetails.domain = url.hostname;
    lnurlDetails.url = url;
    return lnurlDetails;
  },
  async verifyInvoice({ paymentInfo, metadata, amount }) {
    const paymentRequestDetails = parsePaymentRequest({
      request: paymentInfo.pr,
    });
    let metadataHash = "";
    try {
      metadataHash = await sha256(metadata).toString(Hex);
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
