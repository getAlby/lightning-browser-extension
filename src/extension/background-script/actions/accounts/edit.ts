import state from "../../state";
import type { Runtime } from "webextension-polyfill";
import type { MessageAccountEdit } from "~/types";

const edit = async (
  message: MessageAccountEdit,
  _sender: Runtime.MessageSender
) => {
  const accounts = state.getState().accounts;
  const accountId = message.args.id;

  if (typeof accountId === "string" || typeof accountId === "number") {
    accounts[accountId].name = message.args.name;

    state.setState({ accounts });
    // make sure we immediately persist the updated accounts
    await state.getState().saveToStorage();
    return {};
  } else {
    console.log(`Account not found: ${accountId}`);
    return {
      error: "Account not found",
    };
  }

  // make sure we immediately persist the edited account
  await state.getState().saveToStorage();
};

export default edit;
