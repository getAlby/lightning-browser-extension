import * as btc from "@scure/btc-signer";
import { networks } from "bitcoinjs-lib";

export function getTaprootAddressFromPrivateKey(
  privateKey: string,
  networkType?: keyof typeof networks
) {
  const network = networkType ? networks[networkType] : undefined;

  const address = btc.getAddress("tr", Buffer.from(privateKey, "hex"), network);
  if (!address) {
    throw new Error("No taproot address found from private key");
  }
  return address;
}
