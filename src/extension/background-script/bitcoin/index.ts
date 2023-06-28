import * as btc from "@scure/btc-signer";
import Mnemonic from "~/extension/background-script/mnemonic";
import { BitcoinAddress, BitcoinNetworkType } from "~/types";

const BTC_TAPROOT_DERIVATION_PATH = "m/86'/0'/0'/0";
const BTC_TAPROOT_DERIVATION_PATH_REGTEST = "m/86'/1'/0'/0";

class Bitcoin {
  readonly networkType: BitcoinNetworkType;
  readonly mnemonic: Mnemonic;
  readonly network: Network;

  constructor(mnemonic: Mnemonic, networkType: BitcoinNetworkType) {
    this.mnemonic = mnemonic;
    this.networkType = networkType;
    this.network = networks[this.networkType];
  }
  getTaprootAddress(): BitcoinAddress {
    const index = 0;
    const derivationPathWithoutIndex =
      this.networkType === "bitcoin"
        ? BTC_TAPROOT_DERIVATION_PATH
        : BTC_TAPROOT_DERIVATION_PATH_REGTEST;

    const derivationPath = `${derivationPathWithoutIndex}/${index}`;
    const privateKey = this.mnemonic.derivePrivateKey(derivationPath);
    const publicKey = this.mnemonic.derivePublicKey(derivationPath);

    const address = btc.getAddress(
      "tr",
      Buffer.from(privateKey, "hex"),
      this.network
    );
    if (!address) {
      throw new Error("No taproot address found from private key");
    }
    return { address, derivationPath, index, publicKey };
  }
}

export default Bitcoin;

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

export const testnet: Network = {
  messagePrefix: "\x18Bitcoin Signed Message:\n",
  bech32: "tb",
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
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
  testnet,
  regtest,
};
