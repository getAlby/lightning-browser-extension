import { getAddressFromPubkey, getAddressType } from "~/common/lib/btc";
import { decryptData } from "~/common/lib/crypto";
import {
  BTC_TAPROOT_DERIVATION_PATH,
  getPublicKey,
} from "~/common/lib/mnemonic";
import state from "~/extension/background-script/state";
import { MessageGetAddresses } from "~/types";

const getAddresses = async (message: MessageGetAddresses) => {
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

    const addresses: {
      publicKey: string;
      derivationPath: string;
      index: number;
      address: string;
    }[] = [];

    // TODO: derivation path should come from the user's account
    const derivationPath =
      message.args.derivationPath || BTC_TAPROOT_DERIVATION_PATH;
    const accountDerivationPathParts = derivationPath.split("/").slice(0, 4);
    if (accountDerivationPathParts.length !== 4) {
      throw new Error("Invalid account derivation path: " + derivationPath);
    }
    const accountDerivationPath = accountDerivationPathParts.join("/");

    for (let i = 0; i < message.args.num; i++) {
      const index = message.args.index + i;
      const indexDerivationPath =
        accountDerivationPath +
        "/" +
        (message.args.change ? 1 : 0) +
        "/" +
        index;
      const publicKey = getPublicKey(mnemonic, indexDerivationPath);
      const purpose = accountDerivationPathParts[1];
      const coinType = accountDerivationPathParts[2];
      const addressType = getAddressType(purpose);

      const address = getAddressFromPubkey(
        publicKey,
        addressType,
        coinType === "0'" ? "bitcoin" : "regtest"
      );
      addresses.push({
        publicKey,
        derivationPath: indexDerivationPath,
        index,
        address,
      });
    }

    return {
      data: addresses,
    };
  } catch (e) {
    return {
      error: "getAddresses failed: " + e,
    };
  }
};

export default getAddresses;
