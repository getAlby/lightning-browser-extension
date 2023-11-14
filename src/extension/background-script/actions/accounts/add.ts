import { v4 as uuidv4 } from "uuid";
import { encryptData } from "~/common/lib/crypto";
import state from "~/extension/background-script/state";
import type { Account, MessageAccountAdd } from "~/types";

const add = async (message: MessageAccountAdd) => {
  const newAccount = message.args;
  let name = newAccount.name;
  const accounts = state.getState().accounts;
  const tmpAccounts = { ...accounts };

  // get all accounts names to avoid duplicate names
  const accountNames = Object.values(accounts).map((el: Account) => el.name);

  // increase nameSuffix number recursively
  while (accountNames.includes(name)) {
    // get number in between (1) and increase by 1
    const bracketsValue = +name.substring(name.indexOf("(") + 1, name.lastIndexOf(")"));
    const accountNameCount = typeof bracketsValue === 'number' ? bracketsValue + 1 : 0;
    const nameContainsSuffix = name.match(/\(\d\)/);
    // if name already contains a suffix, remove it to add the increased
    if (nameContainsSuffix) {
      const suffixIndex = name.lastIndexOf('(');
      name = name.substring(0, suffixIndex);
    }
    const nameSuffix = ` (${accountNameCount})`;
    name = `${name}${nameSuffix}`;
  }


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
