import browser from "webextension-polyfill";
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
      liquid: null, // reset memoized liquid instance
      mnemonic: null, // reset memoized mnemonic instance
      bitcoin: null, // reset memoized bitcoin instance
      connector: null, // reset memoized connector
      currentAccountId: accountId,
    });
    // init connector this also memoizes the connector in the state object
    await state.getState().getConnector();

    // save the current account id once the connector is loaded
    await state.getState().saveToStorage();

    await notifyAccountChanged();

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

// Send a notification message to the content script
// which will then be posted to the window so websites can sync with the switched account
async function notifyAccountChanged() {
  const tabs = await browser.tabs.query({});
  // Send message to tabs with URLs starting with "http" or "https"
  if (tabs) {
    const validTabs = tabs.filter((tab) => {
      const currentUrl = tab.url || "";
      return currentUrl.startsWith("http") || currentUrl.startsWith("https");
    });

    for (const tab of validTabs) {
      try {
        if (tab.id) {
          await browser.tabs.sendMessage(tab.id, { action: "accountChanged" });
        }
      } catch (error) {
        console.error("Failed to notify account changed", error);
      }
    }
  }
}
