import { getTaprootAddressFromPrivateKey } from "~/common/lib/btc";
import {
  BTC_TAPROOT_DERIVATION_PATH,
  BTC_TAPROOT_DERIVATION_PATH_REGTEST,
} from "~/extension/background-script/mnemonic";
import state from "~/extension/background-script/state";
import { BitcoinAddress, MessageGetAddress } from "~/types";

const getAddress = async (message: MessageGetAddress) => {
  try {
    const mnemonic = await state.getState().getMnemonic();
    const account = await state.getState().getAccount();
    if (!account) {
      throw new Error("No account selected");
    }
    // TODO: move to bitcoin object
    const derivationPath =
      (account.bitcoinNetwork || "bitcoin") === "bitcoin"
        ? BTC_TAPROOT_DERIVATION_PATH
        : BTC_TAPROOT_DERIVATION_PATH_REGTEST;

    const privateKey = mnemonic.derivePrivateKey(derivationPath);
    const publicKey = mnemonic.derivePublicKey(derivationPath);

    const address = getTaprootAddressFromPrivateKey(
      privateKey,
      account.bitcoinNetwork || "bitcoin"
    );

    const data: BitcoinAddress = {
      publicKey,
      derivationPath,
      index: 0,
      address,
    };

    return {
      data,
    };
  } catch (e) {
    console.error("getAddress failed: ", e);
    return {
      error: "getAddress failed: " + e,
    };
  }
};

export default getAddress;
