import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import axios from "axios";
import Hex from "crypto-js/enc-hex";
import hmacSHA256 from "crypto-js/hmac-sha256";
import sha256 from "crypto-js/sha256";
import PubSub from "pubsub-js";
import { decryptData } from "~/common/lib/crypto";
import { signMessage } from "~/common/lib/mnemonic";
import utils from "~/common/lib/utils";
import HashKeySigner from "~/common/utils/signer";
import state from "~/extension/background-script/state";
import {
  AuthResponseObject,
  LNURLDetails,
  LnurlAuthResponse,
  MessageLnurlAuth,
  OriginData,
} from "~/types";

const LNURLAUTH_CANONICAL_PHRASE =
  "DO NOT EVER SIGN THIS TEXT WITH YOUR PRIVATE KEYS! IT IS ONLY USED FOR DERIVATION OF LNURL-AUTH HASHING-KEY, DISCLOSING ITS SIGNATURE WILL COMPROMISE YOUR LNURL-AUTH IDENTITY AND MAY LEAD TO LOSS OF FUNDS!";

/*
  Execute the LNURL auth
  returns the response of the LNURL-auth login request
   or throws an error
*/
export async function authFunction({
  lnurlDetails,
  origin,
}: {
  lnurlDetails: LNURLDetails;
  origin?: OriginData;
}) {
  if (lnurlDetails.tag !== "login")
    throw new Error(
      `LNURL-AUTH FAIL: incorrect tag: ${lnurlDetails.tag} was used`
    );

  const account = await state.getState().getAccount();
  if (!account) {
    throw new Error("LNURL-AUTH FAIL: no account selected");
  }

  let lnSignature: string;

  // use secret key for LNURL auth
  if (
    account.connector ===
    "alby" /* OR TODO: lnurl auth toggle is on for current account && mnemonic exists */
  ) {
    if (!account.mnemonic) {
      throw new Error("Please set a secret key to use LNURL auth");
    }
    const password = await state.getState().password();
    if (!password) {
      throw new Error("No password set");
    }
    const mnemonic = decryptData(account.mnemonic, password);
    lnSignature = await signMessage(mnemonic, LNURLAUTH_CANONICAL_PHRASE);
  } else {
    const connector = await state.getState().getConnector();

    // Note: the signMessage call can fail / this is currently not caught.
    const signResponse = await connector.signMessage({
      message: LNURLAUTH_CANONICAL_PHRASE,
      key_loc: {
        key_family: 0,
        key_index: 0,
      },
    });

    lnSignature = signResponse.data.signature;
  }

  // make sure we got a signature
  if (!lnSignature) {
    throw new Error("Invalid Signature");
  }

  const hashingKey = sha256(lnSignature).toString(Hex);
  const url = new URL(lnurlDetails.url);
  if (!url.host || !hashingKey) {
    throw new Error("Invalid input");
  }

  let linkingKeyPriv;
  const { settings } = state.getState();
  if (settings.isUsingLegacyLnurlAuthKey) {
    linkingKeyPriv = hmacSHA256(url.host, hashingKey).toString(Hex);
  } else {
    linkingKeyPriv = hmacSHA256(url.host, Hex.parse(hashingKey)).toString(Hex);
  }

  // make sure we got a hashingKey and a linkingkey (just to be sure for whatever reason)
  if (!hashingKey || !linkingKeyPriv) {
    throw new Error("Invalid hashingKey/linkingKey");
  }

  const signer = new HashKeySigner(linkingKeyPriv);

  const k1 = utils.hexToUint8Array(lnurlDetails.k1);
  if (!lnurlDetails.k1 || !k1) {
    throw new Error("Invalid K1");
  }
  const signedMessage = signer.sign(k1);
  const signedMessageDERHex = signedMessage.toDER("hex");

  const loginURL = url;
  loginURL.searchParams.set("sig", signedMessageDERHex);
  loginURL.searchParams.set("key", signer.pkHex);
  loginURL.searchParams.set("t", Date.now().toString());

  try {
    const authResponse = await axios.get<AuthResponseObject>(
      loginURL.toString(),
      {
        adapter: fetchAdapter,
      }
    );

    // if the service returned with a HTTP 200 we still check if the response data is OK
    if (authResponse?.data.status?.toUpperCase() !== "OK") {
      throw new Error(
        authResponse?.data?.reason || "Auth: Something went wrong"
      );
    } else {
      PubSub.publish(`lnurl.auth.success`, {
        authResponse,
        lnurlDetails,
        origin,
      });

      const response: LnurlAuthResponse = {
        success: true,
        status: authResponse.data.status,
        reason: authResponse.data.reason,
        authResponseData: authResponse.data,
      };

      return response;
    }
  } catch (e) {
    if (axios.isAxiosError(e)) {
      console.error("LNURL-AUTH FAIL:", e);
      const error =
        (e.response?.data as { reason?: string })?.reason || e.message; // lnurl error or exception message

      PubSub.publish("lnurl.auth.failed", {
        error,
        lnurlDetails,
        origin,
      });

      throw new Error(error);
    } else if (e instanceof Error) {
      PubSub.publish("lnurl.auth.failed", {
        error: e.message,
        lnurlDetails,
        origin,
      });

      throw new Error(e.message);
    }
  }
}

const auth = async (message: MessageLnurlAuth) => {
  const { lnurlDetails, origin } = message.args;
  const response = await authFunction({ lnurlDetails, origin });
  return { data: response };
};

export default auth;
