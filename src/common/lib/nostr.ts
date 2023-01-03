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
};

export default nostr;
