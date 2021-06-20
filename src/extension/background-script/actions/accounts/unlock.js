import { decryptData } from "../../../../common/lib/crypto";
import state from "../../state";

const unlock = (message, sender) => {
  const password = message.args.password;

  const account = state.getState().getAccount();
  if (!account) {
    console.log("No account configured");
    return Promise.resolve({ error: "No account configured" });
  }
  try {
    decryptData(account.config, password);
  } catch (e) {
    console.log("Invalid password");
    return Promise.resolve({ error: "Invalid password" });
  }

  // if everything is fine we keep the password in memory
  state.setState({ password });
  return Promise.resolve({ data: { unlocked: true } });
};

export default unlock;
