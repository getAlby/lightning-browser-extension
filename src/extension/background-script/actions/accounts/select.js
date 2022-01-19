import state from "../../state";

const select = async (message, sender) => {
  const currentState = state.getState();

  const accountId = message.args.id;
  const account = currentState.accounts[accountId];

  if (account) {
    if (currentState.connector) {
      console.log("Unloading connector");
      await currentState.connector.unload();
    }
    state.setState({
      account,
      connector: null, // reset memoized connector
      currentAccountId: accountId,
    });
    // init connector this also memoizes the connector in the state object
    await state.getState().getConnector();

    return {
      data: { unlocked: true },
    };
  } else {
    console.log(`Account not found: ${accountId}`);
    return {
      error: "Account not found",
    };
  }
};

export default select;
