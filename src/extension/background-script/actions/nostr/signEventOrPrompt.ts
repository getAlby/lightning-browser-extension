import * as secp256k1 from "@noble/secp256k1";
import * as nostrTools from "nostr-tools";
import utils from "~/common/lib/utils";
import { Message } from "~/types";

import state from "../../state";

const signEventOrPrompt = async (message: Message) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  // TODO: FIX TYPES
  if (!nostrTools.validateEvent(message.args.event as nostrTools.Event)) {
    console.error("Invalid event");
    return {
      error: "Invalid event.",
    };
  }

  return signWithPrompt(message);
};

async function getPrivateKey(): Promise<Buffer | undefined> {
  const connector = await state.getState().getConnector();
  try {
    const response = await connector.signMessage({
      message:
        "DO NOT EVER SIGN THIS TEXT WITH YOUR PRIVATE KEYS! IT IS ONLY USED FOR DERIVATION OF NOSTR KEY PAIRS, DISCLOSING THIS SIGNATURE WILL COMPROMISE YOUR NOSTR IDENTITY!",
      // TODO: Check if it makes sense to derive the correct key path from nostr
      key_loc: {
        key_family: 0,
        key_index: 0,
      },
    });
    const keymaterial = response.data.signature;
    const uint8 = Uint8Array.from(
      keymaterial.split("").map((x) => x.charCodeAt(0))
    );
    const hex = Buffer.from(secp256k1.utils.hashToPrivateKey(uint8));
    return hex;
  } catch (e) {
    console.error(e);
  }
}

async function signEvent(privateKey: string, message: Message) {
  const event = await nostrTools.signEvent(
    message.args.event as nostrTools.Event,
    privateKey
  );

  return event;
}

async function signWithPrompt(message: Message) {
  // Set the message as the user needs to see the event details
  message.args.message = JSON.stringify(message.args.event);

  try {
    const response = await utils.openPrompt({
      ...message,
      action: "confirmSignMessage",
    });

    const privateKeyBuffer = await getPrivateKey();
    if (!privateKeyBuffer) return;

    // console.log("🔐 Private key", privateKeyBuffer.toString('hex'));
    // const publicKey = Buffer.from(secp256k1.schnorr.getPublicKey(privateKeyBuffer)).toString('hex')
    // console.log("🔐 Public key", publicKey);

    // TODO: REMOVE HACK
    response.data = await signEvent(privateKeyBuffer.toString("hex"), message);

    return response;
  } catch (e) {
    console.error("SignEvent cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
}

export default signEventOrPrompt;
