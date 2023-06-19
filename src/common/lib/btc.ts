import * as btc from "@scure/btc-signer";

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

//
// from https://github1s.com/bitcoinjs/bitcoinjs-lib
interface Network {
  messagePrefix: string;
  bech32: string;
  bip32: Bip32;
  pubKeyHash: number;
  scriptHash: number;
  wif: number;
}

interface Bip32 {
  public: number;
  private: number;
}

const bitcoin: Network = {
  messagePrefix: "\x18Bitcoin Signed Message:\n",
  bech32: "bc",
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
};
const regtest: Network = {
  messagePrefix: "\x18Bitcoin Signed Message:\n",
  bech32: "bcrt",
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

export const networks = {
  bitcoin,
  regtest,
};
