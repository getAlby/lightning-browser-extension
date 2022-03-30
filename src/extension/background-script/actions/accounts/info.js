import state from "../../state";

const info = async (message, sender) => {
  // TODO!
  //if (message.args.id) {
  //  account = state.getState().accounts[message.args.id];
  //} else {
  //  account = state.getState().getAccount();
  //}
  const connector = await state.getState().getConnector();
  const currentAccountId = state.getState().currentAccountId;
  const currentAccount = state.getState().getAccount();
  //const info = await connector.getInfo();
  //const balance = await connector.getBalance();
  const [info, balance] = await Promise.all([
    connector.getInfo(),
    connector.getBalance(),
  ]);

  // TODO error handling
  return {
    data: {
      currentAccountId: currentAccountId,
      name: currentAccount.name,
      info: info.data,
      balance: balance.data,
    },
  };
};

export default info;
