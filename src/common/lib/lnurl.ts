import fetchAdapter from "@vespaiach/axios-fetch-adapter";
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
        const { data }: { data: LNURLDetails | LNURLError } = await axios.get(
          url.toString(),
          {
            adapter: fetchAdapter,
          }
        );

        const lnurlDetails = data;

        if (isLNURLDetailsError(lnurlDetails)) {
          throw new Error(lnurlDetails.reason);
        } else {
          lnurlDetails.domain = url.hostname;
          lnurlDetails.url = url.toString();
        }

        return lnurlDetails;
      } catch (e) {
        let error = "";
        if (axios.isAxiosError(e)) {
          error =
            (e.response?.data as { reason?: string })?.reason || e.message;

          if (this.isLightningAddress(lnurlString)) {
            error = `This is not a valid lightning address. Either the address is invalid or it is using a different and unsupported protocol: ${error}`;
          }
        } else if (e instanceof Error) {
          error = e.message;
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
