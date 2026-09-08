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

/** An error returned by the LNURL service itself (LUD-06 `status: "ERROR"`). */
class LNURLServiceError extends Error {}

const LNURL_TAGS = ["payRequest", "withdrawRequest", "channelRequest", "login"];

/**
 * Only a response that looks like an LNURL service response is processed any
 * further. Anything else (HTML, plain text, unrelated JSON) is rejected with a
 * generic error so its content never leaks into an error message.
 */
const isLNURLResponse = (data: unknown): data is LNURLDetails | LNURLError => {
  if (typeof data !== "object" || data === null) return false;
  const res = data as Record<string, unknown>;
  if (res.status === "ERROR") return typeof res.reason === "string";
  if (typeof res.tag !== "string" || !LNURL_TAGS.includes(res.tag))
    return false;
  return res.tag === "login" || typeof res.callback === "string";
};

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

  normalizeLnurl,

  async getDetails(lnurlString: string): Promise<LNURLError | LNURLDetails> {
    const url = normalizeLnurl(lnurlString);
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
        const { data } = await axios.get<unknown>(url.toString(), {
          adapter: "fetch",
          // https://github.com/lnurl/luds/blob/luds/01.md#http-status-codes-and-content-type
          validateStatus: () => true,
        });

        if (!isLNURLResponse(data)) {
          throw new Error("Invalid LNURL response");
        }

        const lnurlDetails = data;

        if (isLNURLDetailsError(lnurlDetails)) {
          throw new LNURLServiceError(lnurlDetails.reason);
        } else {
          lnurlDetails.domain = url.hostname;
          lnurlDetails.url = url.toString();
        }

        return lnurlDetails;
      } catch (e) {
        // Only the service's own LNURL error text is surfaced. Transport
        // failures and non-LNURL responses are reported generically so the
        // content of an arbitrary endpoint is never relayed to the caller.
        let error: string;
        if (e instanceof LNURLServiceError) {
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
