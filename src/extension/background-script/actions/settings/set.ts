import state from "../../state";

import { Message } from "../../../../types";

const set = async (message: Message) => {
  const { settings } = state.getState();
  const { setting } = message.args;
  const newSettings = {
    ...settings,
    ...setting,
  };
  state.setState({
    settings: newSettings,
  });

  // make sure we immediately persist the new settings
  state.getState().saveToStorage();
  return Promise.resolve({ data: { settings: newSettings } });
};

export default set;
