import axios from "axios";
import Hex from "crypto-js/enc-hex";
import hmacSHA256 from "crypto-js/hmac-sha256";
import sha256 from "crypto-js/sha256";
import PubSub from "pubsub-js";
import utils from "~/common/lib/utils";
import HashKeySigner from "~/common/utils/signer";
import db from "~/extension/background-script/db";
import state from "~/extension/background-script/state";
import { MessageLnurlAuth, LNURLDetails } from "~/types";

const LNURLAUTH_CANONICAL_PHRASE =
  "DO NOT EVER SIGN THIS TEXT WITH YOUR PRIVATE KEYS! IT IS ONLY USED FOR DERIVATION OF LNURL-AUTH HASHING-KEY, DISCLOSING ITS SIGNATURE WILL COMPROMISE YOUR LNURL-AUTH IDENTITY AND MAY LEAD TO LOSS OF FUNDS!";

/*
  Execute the LNURL auth
  returns the response of the LNURL-auth login request
   or throws an error
*/
async function authFunction(lnurlDetails: LNURLDetails) {
  if (lnurlDetails.tag !== "login")
    throw new Error(
      `LNURL-AUTH FAIL: incorrect tag: ${lnurlDetails.tag} was used`
    );

  const connector = await state.getState().getConnector();

  // Note: the signMessage call can fail / this is currently not caught.
  const signResponse = await connector.signMessage({
    message: LNURLAUTH_CANONICAL_PHRASE,
    key_loc: {
      key_family: 0,
      key_index: 0,
    },
  });
  const lnSignature = signResponse.data.signature;

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
    const authResponse = await axios.get<{ status: string; reason?: string }>(
      loginURL.toString()
    );
    return authResponse;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      console.error("LNURL-AUTH FAIL:", e);
      const error =
        (e.response?.data as { reason?: string })?.reason || e.message; // lnurl error or exception message
      throw new Error(error);
    } else if (e instanceof Error) {
      throw new Error(e.message);
    }
  }
}

const auth = async (message: MessageLnurlAuth) => {
  const { lnurlDetails, options, origin } = message.args;

  if (options.isPrompt) {
    try {
      // if the user confirmed (or if we already had a publisher with lnurl auth enabled) we perform the authentication
      if (options.confirmed) {
        let authResponse;
        try {
          // Sign the message and do the authentication request to the service
          authResponse = await authFunction(lnurlDetails);
        } catch (e) {
          console.error(e);
          if (e instanceof Error) {
            PubSub.publish(`lnurl.auth.failed`, {
              error: e.message,
              lnurlDetails,
              origin: origin,
            });

            return { error: e.message };
          }
        }

        // if the service returned with a HTTP 200 we still check if the response data is OK
        if (authResponse?.data.status.toUpperCase() !== "OK") {
          PubSub.publish(`lnurl.auth.failed`, {
            authResponse: authResponse,
            lnurlDetails,
            origin: origin,
          });
          return { error: authResponse?.data?.reason };
        }

        PubSub.publish(`lnurl.auth.success`, {
          authResponse,
          lnurlDetails,
          origin: origin,
        });

        // if auto login should be enabled get the publisher and update the publisher entry
        if (options.remember) {
          const allowance = await db.allowances
            .where("host")
            .equalsIgnoreCase(origin.host)
            .first();

          if (allowance?.id) {
            await db.allowances.update(allowance.id, {
              lnurlAuth: true,
            });
          }
          await db.saveToStorage();
        }
        return { data: authResponse.data };
      }
    } catch (e) {
      console.error(e);
    }
  } else {
    const response = await authFunction(lnurlDetails);
    return response;
  }
};

export default auth;
