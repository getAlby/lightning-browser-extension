import axios from "axios";
import PubSub from "pubsub-js";
import { parsePaymentRequest } from "invoices";

import sha256 from "crypto-js/sha256";
import hmacSHA256 from "crypto-js/hmac-sha256";
import Hex from "crypto-js/enc-hex";

import { Message, LNURLDetails } from "../../../../types";
import HashKeySigner from "../../../../common/utils/signer";
import utils from "../../../../common/lib/utils";
import lnurlLib from "../../../../common/lib/lnurl";
import state from "../../state";
import db from "../../db";

const LNURLAUTH_CANONICAL_PHRASE =
  "DO NOT EVER SIGN THIS TEXT WITH YOUR PRIVATE KEYS! IT IS ONLY USED FOR DERIVATION OF LNURL-AUTH HASHING-KEY, DISCLOSING ITS SIGNATURE WILL COMPROMISE YOUR LNURL-AUTH IDENTITY AND MAY LEAD TO LOSS OF FUNDS!";

async function lnurl(message: Message) {
  try {
    if (typeof message.args.lnurlEncoded !== "string") return;
    const lnurlDetails = await lnurlLib.getDetails(message.args.lnurlEncoded);

    switch (lnurlDetails.tag) {
      case "channelRequest":
        console.log("lnurl-channel");
        return;
      case "login":
        console.log("lnurl-auth");
        console.log(lnurlDetails);
        return authWithPrompt(message, lnurlDetails);
      case "payRequest":
        return payWithPrompt(message, lnurlDetails);
      case "withdrawRequest":
        console.log("lnurl-withdraw");
        return;
      default:
        return;
    }
  } catch (e) {
    console.log(e);
  }
}

async function auth(message: Message, lnurlDetails: LNURLDetails) {
  if (lnurlDetails.tag !== "login")
    throw new Error(
      `LNURL-AUTH FAIL: incorrect tag: ${lnurlDetails.tag} was used`
    );

  const connector = await state.getState().getConnector();

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
  if (!lnurlDetails.url.host || !hashingKey) {
    throw new Error("Invalid input");
  }
  const linkingKeyPriv = hmacSHA256(lnurlDetails.url.host, hashingKey).toString(
    Hex
  );
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

  const loginURL = lnurlDetails.url;
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
      console.log("LNURL-AUTH FAIL:", e);
      console.log(e.response?.data);
      const error = e.response?.data?.reason || e.message; // lnurl error or exception message
      throw new Error(error);
    } else if (e instanceof Error) {
      throw new Error(e.message);
    }
  }
}

async function authWithPrompt(message: Message, lnurlDetails: LNURLDetails) {
  PubSub.publish(`lnurl.auth.start`, { message, lnurlDetails });

  // get the publisher to check if lnurlAuth for auto-login is enabled
  let allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(message.origin.host)
    .first();

  // we have the check the unlock status manually. The account can still be locked
  // If it is locked we must show a prompt to unlock
  const isUnlocked = state.getState().password !== null;

  let loginStatus = { confirmed: true, remember: true };
  // if there is no publisher or lnurlAuth is not enabled we prompt the user
  if (!isUnlocked || !allowance || !allowance.enabled || !allowance.lnurlAuth) {
    const { data } = await utils.openPrompt<{
      confirmed: boolean;
      remember: boolean;
    }>({
      ...message,
      type: "lnurlAuth",
      args: {
        ...message.args,
        lnurlDetails,
      },
    });
    loginStatus = data;
  }

  // if the user confirmed (or if we already had a publisher with lnurl auth enabled) we perform the authentication
  if (loginStatus.confirmed) {
    let authResponse;
    try {
      // Sign the message and do the authentication request to the service
      authResponse = await auth(message, lnurlDetails);
    } catch (e) {
      console.log("LNURL-auth failed");
      console.error(e);
      if (e instanceof Error) {
        PubSub.publish(`lnurl.auth.failed`, {
          error: e.message,
          lnurlDetails,
          origin: message.origin,
        });

        return { error: e.message };
      }
    }

    // if the service returned with a HTTP 200 we still check if the response data is OK
    if (authResponse?.data.status.toUpperCase() !== "OK") {
      PubSub.publish(`lnurl.auth.failed`, {
        authResponse: authResponse,
        lnurlDetails,
        origin: message.origin,
      });
      return { error: authResponse?.data?.reason };
    }

    PubSub.publish(`lnurl.auth.success`, {
      authResponse,
      lnurlDetails,
      origin: message.origin,
    });

    // if auto login should be enabled get the publisher and update the publisher entry
    if (loginStatus.remember) {
      allowance = await db.allowances
        .where("host")
        .equalsIgnoreCase(message.origin.host)
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
}

async function payWithPrompt(message: Message, lnurlDetails: LNURLDetails) {
  await utils.openPrompt({
    ...message,
    type: "lnurlPay",
    args: { ...message.args, lnurlDetails },
  });
}

export async function lnurlPay(message: Message) {
  const { paymentRequest } = message.args;
  if (typeof paymentRequest !== "string") {
    return {
      error: "Payment request missing.",
    };
  }
  const connector = await state.getState().getConnector();

  const paymentRequestDetails = parsePaymentRequest({
    request: paymentRequest,
  });

  const response = await connector.sendPayment({
    paymentRequest,
  });
  utils.publishPaymentNotification(message, paymentRequestDetails, response);
  return response;
}

export default lnurl;
