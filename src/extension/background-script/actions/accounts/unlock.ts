import { decryptData } from "~/common/lib/crypto";
import state from "~/extension/background-script/state";
import i18n from "~/i18n/i18nConfig";
import { commonI18nNamespace } from "~/i18n/namespaces";
import type { MessageAccountUnlock } from "~/types";

const unlock = (message: MessageAccountUnlock) => {
  const passwordArg = message.args.password;
  const password =
    typeof passwordArg === "number" ? `${passwordArg}` : passwordArg;

  const account = state.getState().getAccount();
  const currentAccountId = state.getState().currentAccountId;
  if (!account) {
    console.error("No account configured");
    return Promise.resolve({
      error: i18n.t("errors.unconfigured_account", commonI18nNamespace),
    });
  }

  if (typeof account.config !== "string") {
    console.error("Config must be a string");
    return Promise.resolve({
      error: i18n.t("errors.invalid_config", commonI18nNamespace),
    });
  }

  try {
    decryptData(account.config, password);
  } catch (e) {
    console.error("Invalid password");
    return Promise.resolve({
      error: i18n.t("errors.invalid_password", commonI18nNamespace),
    });
  }

  // if everything is fine we keep the password in memory
  state.setState({ password });

  return Promise.resolve({ data: { unlocked: true, currentAccountId } });
};

export default unlock;
