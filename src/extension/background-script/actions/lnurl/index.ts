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

async function authWithPrompt(message, lnurlDetails) {
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
  const loginResponse = await axios.get(loginURL);

  return loginResponse.data;
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
