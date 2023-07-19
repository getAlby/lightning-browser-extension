import { schnorr } from "@noble/curves/secp256k1";
import * as secp256k1 from "@noble/secp256k1";
import nostrlib from "~/common/lib/nostr";

import { bech32Decode, bech32Encode } from "../utils/helpers";

const nostr = {
  normalizeToHex(str: string) {
    const NIP19Prefixes = ["npub", "nsec", "note"];
    const prefix = str.substring(0, 4);
    if (NIP19Prefixes.includes(prefix)) {
      try {
        const hexStr = bech32Decode(str, "hex");
        return hexStr;
      } catch (e) {
        console.info("ignoring bech32 parsing error", e);
      }
    }
    return str;
  },
  hexToNip19(hex: string, prefix = "nsec") {
    return bech32Encode(prefix, hex);
  },
  derivePublicKey(privateKey: string) {
    const publicKey = schnorr.getPublicKey(
      secp256k1.etc.hexToBytes(privateKey)
    );
    const publicKeyHex = secp256k1.etc.bytesToHex(publicKey);
    return nostrlib.hexToNip19(publicKeyHex, "npub");
  },
};

export default nostr;
