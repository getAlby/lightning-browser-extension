import { networks, payments } from "bitcoinjs-lib";

type SupportedAddressType = "witnesspubkeyhash";

export function getAddressType(purpose: string): SupportedAddressType {
  switch (purpose) {
    case "84'":
      return "witnesspubkeyhash";
    default:
      throw new Error("Unsupported purpose: " + purpose);
  }
}

export function getAddressFromPubkey(
  pubkey: string,
  addressType: SupportedAddressType,
  networkType?: keyof typeof networks
) {
  const network = networkType ? networks[networkType] : undefined;

  let address: string | undefined;
  switch (addressType) {
    case "witnesspubkeyhash":
      address = payments.p2wpkh({
        pubkey: Buffer.from(pubkey, "hex"),
        network,
      }).address;
      break;
    default:
      throw new Error("Unsupported address type: " + addressType);
  }
  if (!address) {
    throw new Error(
      "No address found for " + pubkey + " (" + addressType + ")"
    );
  }
  return address;
}
