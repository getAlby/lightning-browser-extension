import state from "~/extension/background-script/state";
import type { MessageAccountEdit } from "~/types";

const edit = async (message: MessageAccountEdit) => {
  const accounts = state.getState().accounts;
  const accountId = message.args.id;

  if (accountId in accounts) {
    if (message.args.name) {
      accounts[accountId].name = message.args.name;
    }
    if (message.args.bitcoinNetwork) {
      accounts[accountId].bitcoinNetwork = message.args.bitcoinNetwork;

      state.setState({
        bitcoin: null, // reset memoized bitcoin state
        liquid: null, // reset memoized liquid state
      });
    }
    if (message.args.useMnemonicForLnurlAuth !== undefined) {
      accounts[accountId].useMnemonicForLnurlAuth =
        message.args.useMnemonicForLnurlAuth;
    }

    if (message.args.isMnemonicBackupDone !== undefined) {
      accounts[accountId].isMnemonicBackupDone =
        message.args.isMnemonicBackupDone;
    }

    state.setState({ accounts });
    // make sure we immediately persist the updated accounts
    await state.getState().saveToStorage();
    return {};
  } else {
    return {
      error: `Account not found: ${accountId}`,
    };
  }
};

export default edit;
