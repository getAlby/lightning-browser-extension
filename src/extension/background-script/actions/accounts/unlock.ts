import { decryptData } from "~/common/lib/crypto";
import state from "~/extension/background-script/state";
import type { MessageAccountUnlock } from "~/types";

const unlock = (message: MessageAccountUnlock) => {
  const passwordArg = message.args.password;
  const password =
    typeof passwordArg === "number" ? `${passwordArg}` : passwordArg;

  const account = state.getState().getAccount();
  const currentAccountId = state.getState().currentAccountId;
  if (!account) {
    console.error("No account configured");
    return Promise.resolve({ error: "No account configured" });
  }

  if (typeof account.config !== "string") {
    console.error("Config must be a string");
    return Promise.resolve({ error: "Config must be a string" });
  }

  try {
    decryptData(account.config, password);
  } catch (e) {
    console.error("Invalid password");
    return Promise.resolve({ error: "Invalid password" });
  }

  // if everything is fine we keep the password in memory
  state.setState({ password });

  return Promise.resolve({ data: { unlocked: true, currentAccountId } });
};

export default unlock;
