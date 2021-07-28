import axios from "axios";
import PubSub from "pubsub-js";
import { parsePaymentRequest } from "invoices";

import sha256 from "crypto-js/sha256";
import hmacSHA256 from "crypto-js/hmac-sha256";
import Base64 from 'crypto-js/enc-base64';
import UTF8 from 'crypto-js/enc-utf8';
import Hex from "crypto-js/enc-hex";

import utils from "../../../../common/lib/utils";
import state from "../../state";
import db from "../../db";
import { bech32Decode } from "../../../../common/utils/helpers";

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const LNURLAUTH_CANONICAL_PHRASE =
    'DO NOT EVER SIGN THIS TEXT WITH YOUR PRIVATE KEYS! IT IS ONLY USED FOR DERIVATION OF LNURL-AUTH HASHING-KEY, DISCLOSING ITS SIGNATURE WILL COMPROMISE YOUR LNURL-AUTH IDENTITY AND MAY LEAD TO LOSS OF FUNDS!';

async function lnurl(message) {
  try {
    const lnurlDecoded = bech32Decode(message.args.lnurlEncoded);
    const url = new URL(lnurlDecoded);
    let lnurlType = url.searchParams.get("tag");
    let lnurlDetails;

    if (lnurlType === "login") {
      lnurlDetails = {
        k1: url.searchParams.get("k1"),
        action: url.searchParams.get("action"),
        url,
      };
    } else {
      const res = await axios.get(lnurlDecoded);
      lnurlDetails = res.data;
      lnurlType = res.data.tag;
    }

    switch (lnurlType) {
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
    console.log(e.message);
  }
}

async function auth(message, lnurlDetails) {
  const connector = state.getState().getConnector();
  const signResponse = await connector.signMessage({
    msg: Base64.stringify(UTF8.parse(LNURLAUTH_CANONICAL_PHRASE)),
    key_loc: {
      key_family: 0,
      key_index: 0,
    },
  });
  const lnSignature = signResponse.signature;

  // TODO: add assertions we got a valid signature, k1 and host

  const hashingKey = sha256(lnSignature).toString(Hex);
  const linkingKeyPriv = hmacSHA256(lnurlDetails.url.host, hashingKey).toString(Hex);

  const sk = ec.keyFromPrivate(linkingKeyPriv);
  const pk = sk.getPublic();
  const pkHex = pk.encodeCompressed('hex');//pk.encode('hex')

  const k1Hex = utils.hexToUint8Array(lnurlDetails.k1);
  const signedMessage = sk.sign(k1Hex);

  const signedMessageDERHex = signedMessage.toDER('hex');

  const loginURL = lnurlDetails.url;
  loginURL.searchParams.set('sig', signedMessageDERHex);
  loginURL.searchParams.set('key', pkHex);
  loginURL.searchParams.set('t', Date.now())
  const authResponse = await axios.get(loginURL);

  return authResponse;
}

async function authWithPrompt(message, lnurlDetails) {
  PubSub.publish(`lnurl.auth.start`, {message, lnurlDetails});

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
    const { data } = await utils.openPrompt({
      ...message,
      type: "lnurlAuth",
      args: { ...message.args, host: lnurlDetails.url.host, pathname: lnurlDetails.url.pathname },
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
      PubSub.publish(`lnurl.auth.failed`, {
        authResponse: e.response,
        lnurlDetails,
        origin: message.origin,
      });

      const reason = e.response?.data?.reason || e.message;
      return { error: reason }
    }

    // if the service returned with a HTTP 200 we still check if the response data is OK
    if (!authResponse.data.status.toUpperCase() === 'OK') {
      PubSub.publish(`lnurl.auth.failed`, {
        authResponse: authResponse,
        lnurlDetails,
        origin: message.origin,
      });
      return { error: e.response?.data?.reason}
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
      await db.allowances.update(allowance.id, {
        lnurlAuth: true,
      });
      await db.saveToStorage();
    }
    return { data: authResponse.data };
  }
}

async function payWithPrompt(message, lnurlDetails) {
  const { data } = await utils.openPrompt({
    ...message,
    type: "lnurlPay",
    args: { ...message.args, lnurlDetails },
  });
  const { confirmed, paymentRequest, successCallback } = data;
  if (confirmed && paymentRequest) {
    // to get the connector the account must be unlocked. The opened prompt also takes care of that
    const connector = state.getState().getConnector();
    const paymentRequestDetails = parsePaymentRequest({
      request: paymentRequest,
    });

    try {
      const response = await connector.sendPayment({
        paymentRequest,
      });
      publishPaymentNotification(message, paymentRequestDetails, response);

      if (successCallback) successCallback();

      return response;
    } catch (e) {
      console.log(e.message);
    }
  }
}

function publishPaymentNotification(message, paymentRequestDetails, response) {
  let status = "success"; // default. let's hope for success
  if (response.data.payment_error) {
    status = "failed";
  }
  PubSub.publish(`ln.sendPayment.${status}`, {
    response,
    paymentRequestDetails,
    origin: message.origin,
  });
}

export default lnurl;
