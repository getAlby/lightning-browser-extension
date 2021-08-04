import sha256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";
import { parsePaymentRequest } from "invoices";

const lnurl = {
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
