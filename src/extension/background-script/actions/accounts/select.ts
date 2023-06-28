import state from "~/extension/background-script/state";
import type { MessageAccountSelect } from "~/types";

const select = async (message: MessageAccountSelect) => {
  const currentState = state.getState();
  const accountId = message.args.id;
  const account = currentState.accounts[accountId];

  if (account) {
    if (currentState.connector) {
      console.info("Unloading connector");
      const connector = await currentState.connector;
      await connector.unload();
    }

    state.setState({
      account,
      nostr: null, // reset memoized nostr instance
      mnemonic: null, // reset memoized mnemonic instance
      bitcoin: null, // reset memoized bitcoin instance
      connector: null, // reset memoized connector
      currentAccountId: accountId,
    });
    // init connector this also memoizes the connector in the state object
    await state.getState().getConnector();

    // save the current account id once the connector is loaded
    await state.getState().saveToStorage();

    return {
      data: { unlocked: true },
    };
  } else {
    console.error(`Account not found: ${accountId}`);
    return {
      error: `Account not found: ${accountId}`,
    };
  }
};

export default select;
