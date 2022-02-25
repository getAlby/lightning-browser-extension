import type { Message } from "../../../../types";
import state from "../../state";

const deleteAccount = async (message: Message) => {
  const accounts = state.getState().accounts;

  let accountId = message.args.id;
  if (accountId === undefined) {
    accountId = state.getState().currentAccountId;
  }

  if (typeof accountId === "string" || typeof accountId === "number") {
    delete accounts[accountId];

    state.setState({ accounts });
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
