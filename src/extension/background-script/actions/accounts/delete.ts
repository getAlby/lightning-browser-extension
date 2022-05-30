import type { MessageAccountDelete } from "~/types";
import state from "~/extension/background-script/state";

const deleteAccount = async (message: MessageAccountDelete) => {
  const accounts = state.getState().accounts;

  let currentAccountId = state.getState().currentAccountId;
  let accountId = message.args.id;

  // if no account is specified, delete the current account
  if (accountId === undefined && currentAccountId !== null) {
    accountId = currentAccountId;
  }

  if (typeof accountId === "string" || typeof accountId === "number") {
    delete accounts[accountId];
    state.setState({ accounts });

    // if the current account gets deleted we select a new "current account"
    if (accountId === currentAccountId) {
      const accountIds = Object.keys(accounts);
      if (accountIds.length > 0) {
        currentAccountId = accountIds[0];
      }
      state.setState({ currentAccountId });
    }

    // make sure we immediately persist the updated accounts
    await state.getState().saveToStorage();
    return {
      data: { deleted: accountId },
    };
  } else {
    return {
      error: `Account not found: ${accountId}`,
    };
  }
};

export default deleteAccount;
