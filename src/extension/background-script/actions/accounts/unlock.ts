import { decryptData } from "~/common/lib/crypto";
import state from "~/extension/background-script/state";
import i18n from "~/i18n/i18nConfig";
import type { MessageAccountUnlock } from "~/types";

const unlock = async (message: MessageAccountUnlock) => {
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
    return Promise.resolve({
      error: i18n.t("translation:unlock.errors.invalid_password"),
    });
  }

  // if everything is fine we keep the password in memory
  await state.getState().password(password);

  // load the connector to make sure it is initialized for the future calls
  // with this we prevent potentially multiple action calls trying to initialize the connector in parallel
  // we have to be careful here: if the unlock fails (e.g. because of an error in getConnector() the user
  // might be locked out of Alby and can not unlock and get to another account
  try {
    await state.getState().getConnector();
  } catch (e) {
    // TODO: somehow notify the user that something is wrong with the connection
    console.error(e);
  }

  return { data: { unlocked: true, currentAccountId } };
};

export default unlock;
