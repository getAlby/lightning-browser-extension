import { decryptData } from "../../../../common/lib/crypto";
import state from "../../state";
const connectors = require("../../connectors");

const unlock = (message, sender) => {
  const currentState = state.getState();
  const password = message.args.password;
  state.setState({ password });

  const account = currentState.accounts[currentState.currentAccountId];
  if (account) {
    const config = decryptData(account.config, password, "");

    const connector = new connectors[account.connector](config);
    state.setState({
      account,
      connector,
    });
  }
  return Promise.resolve({ data: { unlocked: true } });
};

export default unlock;
