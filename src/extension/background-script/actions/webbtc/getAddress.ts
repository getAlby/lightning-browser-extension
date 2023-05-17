import { getAddressFromPubkey, getAddressType } from "~/common/lib/btc";
import { decryptData } from "~/common/lib/crypto";
import {
  BTC_TAPROOT_DERIVATION_PATH,
  BTC_TAPROOT_DERIVATION_PATH_REGTEST,
  getPublicKey,
} from "~/common/lib/mnemonic";
import state from "~/extension/background-script/state";
import { BitcoinAddress, MessageGetAddress } from "~/types";

const getAddress = async (message: MessageGetAddress) => {
  try {
    // TODO: is this the correct way to decrypt the mnmenonic?
    const password = await state.getState().password();
    if (!password) {
      throw new Error("No password set");
    }
    const account = await state.getState().getAccount();
    if (!account) {
      throw new Error("No account selected");
    }
    if (!account.mnemonic) {
      throw new Error("No mnemonic set");
    }
    const mnemonic = decryptData(account.mnemonic, password);
    const settings = state.getState().settings;

    const derivationPath =
      settings.bitcoinNetwork === "bitcoin"
        ? BTC_TAPROOT_DERIVATION_PATH
        : BTC_TAPROOT_DERIVATION_PATH_REGTEST;

    const derivationPathParts = derivationPath.split("/");
    const publicKey = getPublicKey(mnemonic, derivationPath);
    const purpose = derivationPathParts[1];
    const addressType = getAddressType(purpose);

    const address = getAddressFromPubkey(
      publicKey,
      addressType,
      settings.bitcoinNetwork
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
    return {
      error: "getAddress failed: " + e,
    };
  }
};

export default getAddress;
