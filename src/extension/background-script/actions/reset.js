import state from "../state";

const reset = (message, sender) => {
  state.setState({
    settings: { debug: true },
    accounts: {},
    password: null,
    currentAccountId: null,
  });

  return Promise.resolve({ data: { reset: true } });
};

export default reset;
