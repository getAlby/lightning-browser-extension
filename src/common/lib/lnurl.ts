import axios from "axios";
import lightningPayReq from "bolt11-signet";
import { isLNURLDetailsError } from "~/common/utils/typeHelpers";
import {
  LNURLAuthServiceResponse,
  LNURLDetails,
  LNURLError,
  LNURLPaymentInfo,
} from "~/types";

import { bech32Decode } from "../utils/helpers";
import { assertAllowedLnurlUrl, lnurlGet } from "./lnurlValidation";

/** An error returned by the LNURL service itself (LUD-06 `status: "ERROR"`). */
class LNURLServiceError extends Error {}

const fromInternetIdentifier = (address: string) => {
  // email regex: https://emailregex.com/
  // modified to allow _ in subdomains
  if (
    address.match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-_0-9]+\.)+[a-zA-Z]{2,}))$/
    )
  ) {
    let [name, host] = address.split("@");
    // remove invisible characters %EF%B8%8F
    name = name.replace(/[^ -~]+/g, "");
    host = host.replace(/[^ -~]+/g, "");
    return `https://${host}/.well-known/lnurlp/${name}`;
  }
  return null;
};

const normalizeLnurl = (lnurlString: string) => {
  // maybe it's bech32 encoded?
  try {
    const url = bech32Decode(lnurlString);
    return new URL(url);
  } catch (e) {
    console.info("ignoring bech32 parsing error", e);
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
  isLightningAddress(address: string) {
    return Boolean(fromInternetIdentifier(address));
  },

  findLnurl(text: string) {
    const stringToText = text.trim();
    let match;

    // look for a LNURL with protocol scheme
    if ((match = stringToText.match(/lnurl[pwc]:(\S+)/i))) {
      return match[1];
    }

    // look for LNURL bech32 in the string
    if ((match = stringToText.match(/(lnurl[a-zA-HJ-NP-Z0-9]+)/i))) {
      return match[1];
    }

    return null;
  },

  /**
   * `userInitiated` marks an LNURL the user pasted or scanned themselves. Those
   * may point at a self-hosted service on a local network; LNURLs supplied by a
   * website may not, since the request is made from a privileged context.
   */
  async getDetails(
    lnurlString: string,
    { userInitiated = false } = {}
  ): Promise<LNURLError | LNURLDetails> {
    const url = userInitiated
      ? normalizeLnurl(lnurlString)
      : assertAllowedLnurlUrl(normalizeLnurl(lnurlString));
    const searchParamsTag = url.searchParams.get("tag");
    const searchParamsK1 = url.searchParams.get("k1");
    const searchParamsAction = url.searchParams.get("action");

    if (searchParamsTag && searchParamsTag === "login" && searchParamsK1) {
      const lnurlAuthDetails: LNURLAuthServiceResponse = {
        ...(searchParamsAction && { action: searchParamsAction }),
        domain: url.hostname,
        k1: searchParamsK1,
        tag: searchParamsTag,
        url: url.toString(),
      };

      return lnurlAuthDetails;
    } else {
      try {
        const { data }: { data: LNURLDetails | LNURLError } = await lnurlGet<
          LNURLDetails | LNURLError
        >(
          url,
          {},
          { validate: !userInitiated, followRedirects: userInitiated }
        );

        const lnurlDetails = data;

        if (isLNURLDetailsError(lnurlDetails)) {
          throw new LNURLServiceError(lnurlDetails.reason);
        } else {
          lnurlDetails.domain = url.hostname;
          lnurlDetails.url = url.toString();
        }

        return lnurlDetails;
      } catch (e) {
        // The service's own error text is safe to surface: the endpoint host has
        // already been validated. Transport failures are reported generically so
        // the response of an arbitrary endpoint is not relayed back to a caller.
        let error: string;
        if (e instanceof LNURLServiceError) {
          error = e.message;
        } else if (
          !axios.isAxiosError(e) &&
          e instanceof Error &&
          e.message.startsWith("Invalid LNURL")
        ) {
          error = e.message;
        } else if (this.isLightningAddress(lnurlString)) {
          error =
            "Could not reach this lightning address. It may be invalid, or its server may be unavailable.";
        } else {
          error = "Failed to load LNURL details";
        }

        throw new Error(error);
      }
    }
  },

  verifyInvoice({
    paymentInfo,
    amount,
  }: {
    paymentInfo: LNURLPaymentInfo;
    amount: number;
  }) {
    const paymentRequestDetails = lightningPayReq.decode(paymentInfo.pr);
    switch (true) {
      case paymentRequestDetails.millisatoshis !== String(amount): // LN WALLET Verifies that amount in provided invoice equals an amount previously specified by user
      case paymentInfo.successAction &&
        !["url", "message", "aes"].includes(paymentInfo.successAction.tag): // If successAction is not null: LN WALLET makes sure that tag value of is of supported type, aborts a payment otherwise
        return false;
      default:
        return true;
    }
  },
};

export default lnurl;
