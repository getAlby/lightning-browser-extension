import state from "~/extension/background-script/state";
import type { MessageAccountRemove } from "~/types";

const remove = async (message: MessageAccountRemove) => {
  const accounts = state.getState().accounts;
  let currentAccountId = state.getState().currentAccountId;
  let accountId = message?.args?.id;

  // if no account is specified, remove the current account
  if (!accountId && currentAccountId !== null) {
    accountId = currentAccountId;
  }

  if (typeof accountId === "string" || typeof accountId === "number") {
    delete accounts[accountId];
    state.setState({ accounts });
    const accountsUpdated = state.getState().accounts;
    const accountIds = Object.keys(accountsUpdated);

    // if the current account gets removed we select a new "current account"
    if (accountId === currentAccountId && accountIds.length > 0) {
      currentAccountId = accountIds[0];
      state.setState({ currentAccountId });
    }

    // make sure we immediately persist the updated accounts
    await state.getState().saveToStorage();
    return {
      data: { removed: accountId },
    };
  } else {
    return {
      error: `Account not found: ${accountId}`,
    };
  }
};

export default remove;
