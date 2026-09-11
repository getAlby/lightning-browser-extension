import { v4 as uuidv4 } from "uuid";
import { encryptData } from "~/common/lib/crypto";
import { getUniqueAccountName } from "~/common/utils/validations";
import connectors from "~/extension/background-script/connectors";
import state from "~/extension/background-script/state";
import type { MessageAccountAdd } from "~/types";

const add = async (message: MessageAccountAdd) => {
  const newAccount = message.args;

  // Validate connector type
  if (!newAccount.connector || !(newAccount.connector in connectors)) {
    return { error: "Invalid connector type" };
  }

  // Validate config is present
  if (
    !newAccount.config ||
    typeof newAccount.config !== "string" ||
    newAccount.config.trim() === ""
  ) {
    return { error: "Account config is required" };
  }

  // Validate name is present
  if (
    !newAccount.name ||
    typeof newAccount.name !== "string" ||
    newAccount.name.trim() === ""
  ) {
    return { error: "Account name is required" };
  }

  const accounts = state.getState().accounts;
  const name = getUniqueAccountName(newAccount.name, accounts);
  const tmpAccounts = { ...accounts };

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

  state.setState({ accounts: tmpAccounts });

  if (!currentAccountId) {
    state.setState({ currentAccountId: accountId });
  }

  // make sure we immediately persist the new account
  await state.getState().saveToStorage();
  return { data: { accountId: accountId } };
};

export default add;
