import state from "../../state";

import { Message } from "../../../../types";

const DEFAULT_SETTINGS = {
  websiteEnhancements: true,
  userName: "",
};

const set = async (message: Message) => {
  const { settings } = state.getState();
  const { setting } = message.args;
  if (typeof setting === "object") {
    const newSettings = {
      ...DEFAULT_SETTINGS,
      ...settings,
      ...setting,
    };
    state.setState({
      settings: newSettings,
    });

    // make sure we immediately persist the new settings
    state.getState().saveToStorage();
    return Promise.resolve({ data: newSettings });
  } else {
    return Promise.reject(new Error("Incorrect setting"));
  }
};

export default set;
