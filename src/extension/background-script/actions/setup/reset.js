import state, { DEFAULT_SETTINGS } from "../../state";

const reset = async (message, sender) => {
  state.setState({
    settings: DEFAULT_SETTINGS,
    accounts: {},
    account: null,
    connector: null,
    password: null,
    currentAccountId: null,
  });

  return { data: { reset: true } };
};

export default reset;
