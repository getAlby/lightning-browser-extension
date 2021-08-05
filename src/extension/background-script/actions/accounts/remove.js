import state from "../../state";

const remove = async (message, sender) => {
  const accounts = state.getState().accounts;
  const currentAccountId = state.getState().currentAccountId;

  delete accounts[currentAccountId];

  state.setState({ accounts });
  return {
    data: { deleted: currentAccountId },
  };
};

export default remove;
