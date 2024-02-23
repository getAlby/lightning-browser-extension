import { v4 as uuidv4 } from "uuid";
import { encryptData } from "~/common/lib/crypto";
import { getUniqueAccountName } from "~/common/utils/validations";
import edit from "~/extension/background-script/actions/accounts/edit";
import {
  generateMnemonic,
  setMnemonic,
} from "~/extension/background-script/actions/mnemonic";
import state from "~/extension/background-script/state";
import type { MessageAccountAdd } from "~/types";

const add = async (message: MessageAccountAdd) => {
  const newAccount = message.args;
  const accounts = state.getState().accounts;
  const name = getUniqueAccountName(newAccount.name, accounts);
  const tmpAccounts = { ...accounts };

  // TODO: add validations
  // TODO: make sure a password is set
  const password = await state.getState().password();
  if (!password) return { error: "Password is missing" };

  const currentAccountId = state.getState().currentAccountId;
  const accountId = uuidv4();
  newAccount.config = encryptData(newAccount.config, password);
  tmpAccounts[accountId] = {
    ...newAccount,
    id: accountId,
    name,
    isMnemonicBackupDone: false,
  };

  const mnemonic = await generateMnemonic({
    action: "generateMnemonic",
    origin: { internal: true },
  });
  setMnemonic({
    args: {
      id: accountId,
      mnemonic: mnemonic.data,
    },
    action: "setMnemonic",
    origin: { internal: true },
  });

  state.setState({ accounts: tmpAccounts });

  if (!currentAccountId) {
    state.setState({ currentAccountId: accountId });
  }

  edit({
    args: {
      id: accountId,
      useMnemonicForLnurlAuth: true,
    },
    action: "editAccount",
    origin: { internal: true },
  });

  // make sure we immediately persist the new account
  await state.getState().saveToStorage();
  return { data: { accountId: accountId } };
};

export default add;
