import { decryptData } from "../../../../common/lib/crypto";
import state from "../../state";
import connectors from "../../connectors";

const select = async (message, sender) => {
  const currentState = state.getState();

  const accountId = message.args.id;
  const account = currentState.accounts[accountId];

  if (account) {
    console.log(`Loading account ${accountId}`);
    // unload currently selected account
    if (currentState.connector) {
      console.log("unload connector");
      await currentState.connector.unload();
    }
    state.setState({
      account,
      connector: null,
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
