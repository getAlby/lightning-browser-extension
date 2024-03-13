import * as secp256k1 from "@noble/secp256k1";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import axios from "axios";
import { Buffer } from "buffer";
import Hex from "crypto-js/enc-hex";
import Utf8 from "crypto-js/enc-utf8";
import hmacSHA256 from "crypto-js/hmac-sha256";
import sha256 from "crypto-js/sha256";
import PubSub from "pubsub-js";
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

  const url = new URL(lnurlDetails.url);
  if (!url.host) {
    throw new Error("Invalid input");
  }

  let linkingKeyPriv: string;

  // use mnemonic for LNURL auth
  if (account.mnemonic && account.useMnemonicForLnurlAuth) {
    const mnemonic = await state.getState().getMnemonic();

    // See https://github.com/lnurl/luds/blob/luds/05.md
    const hashingKey = mnemonic.deriveKey("m/138'/0");
    const hashingPrivateKey = hashingKey.privateKey as Uint8Array;

    const pathSuffix = getPathSuffix(
      url.host,
      secp256k1.etc.bytesToHex(hashingPrivateKey)
    );

    // Derive key manually (rather than using mnemonic.deriveKey with full path) due to
    // https://github.com/paulmillr/scure-bip32/issues/8
    let linkingKey = mnemonic.deriveKey("m/138'");
    for (const index of pathSuffix) {
      linkingKey = linkingKey.deriveChild(index);
    }

    linkingKeyPriv = secp256k1.etc.bytesToHex(
      linkingKey.privateKey as Uint8Array
    );
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

    const keyMaterialForSignature = signResponse.data.signature;

    // make sure we got a signature
    if (!keyMaterialForSignature) {
      throw new Error("Invalid Signature");
    }

    const hashingKey = sha256(keyMaterialForSignature).toString(Hex);

    linkingKeyPriv = hmacSHA256(url.host, Hex.parse(hashingKey)).toString(Hex);
  }

  // make sure we got a linkingkey (just to be sure for whatever reason)
  if (!linkingKeyPriv) {
    throw new Error("Invalid linkingKey");
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

      throw e;
    }
  }
}

// see https://github.com/lnurl/luds/blob/luds/05.md
export function getPathSuffix(domain: string, privateKeyHex: string) {
  const derivationMaterial = hmacSHA256(
    Utf8.parse(domain),
    Hex.parse(privateKeyHex)
  ).toString(Hex);

  const buf = Buffer.from(derivationMaterial, "hex");

  const pathSuffix = [];
  for (let i = 0; i < 4; i++) {
    pathSuffix.push(buf.readUint32BE(i * 4));
  }
  return pathSuffix;
}

const auth = async (message: MessageLnurlAuth) => {
  const { lnurlDetails, origin } = message.args;
  const response = await authFunction({ lnurlDetails, origin });
  return { data: response };
};

export default auth;
