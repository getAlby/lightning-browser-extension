import { Message } from "~/types";

import state from "../../state";

const set = async (message: Message) => {
  const { settings } = state.getState();
  const { setting } = message.args;
  if (typeof setting === "object") {
    const newSettings = {
      ...settings,
      ...setting,
    };
    state.setState({
      settings: newSettings,
    });

    // make sure we immediately persist the new settings
    await state.getState().saveToStorage();
    return Promise.resolve({ data: newSettings });
  } else {
    return Promise.reject(new Error("Incorrect setting"));
  }
};

export default set;
