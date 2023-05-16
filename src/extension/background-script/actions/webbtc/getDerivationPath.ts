import { decryptData } from "~/common/lib/crypto";
import state from "~/extension/background-script/state";
import { MessageGetDerivationPath } from "~/types";

const getDerivationPath = async (message: MessageGetDerivationPath) => {
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
    let derivationPath: string | undefined;

    if (account.bip32DerivationPath) {
      derivationPath = decryptData(account.bip32DerivationPath, password);
    }
    return {
      data: derivationPath,
    };
  } catch (e) {
    return {
      error: "getDerivationPath failed: " + e,
    };
  }
};

export default getDerivationPath;
