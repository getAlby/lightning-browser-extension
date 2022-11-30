import { decryptData } from "~/common/lib/crypto";
import state from "~/extension/background-script/state";
import i18n from "~/i18n/i18nConfig";
import { translationI18nNamespace } from "~/i18n/namespaces";
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
      error: i18n.t("unlock.errors.invalid_password", translationI18nNamespace),
    });
  }

  // if everything is fine we keep the password in memory
  state.setState({ password });
  // load the connector to make sure it is initialized for the future calls
  // with this we prevent potentially multiple action calls trying to initialize the connector in parallel
  await state.getState().getConnector();

  return { data: { unlocked: true, currentAccountId } };
};

export default unlock;
