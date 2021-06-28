import state from "../../state";

const info = (message, sender) => {
  let connector;
  // TODO!
  //if (message.args.id) {
  //  account = state.getState().accounts[message.args.id];
  //} else {
  //  account = state.getState().getAccount();
  //}
  connector = state.getState().getConnector();

  const info = connector.getInfo();

  return Promise.resolve({ data: info });
};

export default info;
