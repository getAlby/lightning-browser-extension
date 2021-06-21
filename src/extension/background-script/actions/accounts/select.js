import { decryptData } from "../../../../common/lib/crypto";
import state from "../../state";
import connectors from "../../connectors";

const select = (message, sender) => {
  const currentState = state.getState();

  const accountId = message.args.id;
  const account = currentState.accounts[accountId];

  if (account) {
    console.log(`Loading account ${accountId}`);

    const config = decryptData(account.config, currentState.password);
    const connector = new connectors[account.connector](config);
    state.setState({
      account,
      connector,
      currentAccountId: accountId,
    });
    return Promise.resolve({ data: { unlocked: true } });
  } else {
    console.log(`Account not found: ${accountId}`);
    return Promise.reject({ error: "Account not found" });
  }
};

export default select;
