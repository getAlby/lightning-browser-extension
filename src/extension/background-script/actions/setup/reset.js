import state from "../../state";

const reset = async (message, sender) => {
  state.setState({
    accounts: {},
    account: null,
    connector: null,
    password: null,
    currentAccountId: null,
  });
  await state.getState().saveToStorage();

  return { data: { reset: true } };
};

export default reset;
