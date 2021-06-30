import state from "../../state";

const info = async (message, sender) => {
  let connector;
  // TODO!
  //if (message.args.id) {
  //  account = state.getState().accounts[message.args.id];
  //} else {
  //  account = state.getState().getAccount();
  //}
  connector = state.getState().getConnector();

  const [info, balance] = await Promise.all([
    connector.getInfo(),
    connector.getBalance(),
  ]);

  // TODO error handling
  return {
    data: { info: info.data, balance: balance.data },
  };
};

export default info;
