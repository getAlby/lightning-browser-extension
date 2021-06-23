import state from "../state";

const reset = async (message, sender) => {
  state.setState({
    settings: { debug: true },
    accounts: {},
    password: null,
    currentAccountId: null,
  });
  await browser.storage.sync.set({ allowances: [] });

  return { data: { reset: true } };
};

export default reset;
