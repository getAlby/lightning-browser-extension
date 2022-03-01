import state from "../../state";

const edit = async (message, sender) => {
  console.log("EDIT ACCOUNT", message);
  const accounts = state.getState().accounts;

  let accountId = message.args.id;
  if (accountId === undefined) {
    accountId = state.getState().currentAccountId;
  }

  if (typeof accountId === "string" || typeof accountId === "number") {
    accounts[accountId].name = message.args.name;

    state.setState({ accounts });
    // make sure we immediately persist the updated accounts
    await state.getState().saveToStorage();
    return {
      // data: { deleted: accountId },
    };
  } else {
    console.log(`Account not found: ${accountId}`);
    return {
      error: "Account not found",
    };
  }

  // // make sure we immediately persist the new account
  // await state.getState().saveToStorage();
  // return { data: { accountId: accountId } };
};

export default edit;
