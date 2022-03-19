import type { Message } from "../../../../types";
import state from "../../state";

// @TODO: https://github.com/getAlby/lightning-browser-extension/issues/652
// align Message-Types
const deleteAccount = async (message: Message) => {
  const accounts = state.getState().accounts;

  let accountId = message.args?.id;
  if (accountId === undefined) {
    accountId = state.getState().currentAccountId;
  }

  if (typeof accountId === "string" || typeof accountId === "number") {
    delete accounts[accountId];

    const accountIds = Object.keys(accounts);
    let currentAccountId = null;
    if (accountIds.length > 0) {
      currentAccountId = accountIds[0];
    }
    state.setState({ accounts, currentAccountId });
    // make sure we immediately persist the updated accounts
    await state.getState().saveToStorage();
    return {
      data: { deleted: accountId },
    };
  } else {
    console.log(`Account not found: ${accountId}`);
    return {
      error: "Account not found",
    };
  }
};

export default deleteAccount;
