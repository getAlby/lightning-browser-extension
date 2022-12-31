import { bech32Decode } from "../utils/helpers";

const nostr = {
  normalizeHex(str: string) {
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
};

export default nostr;
