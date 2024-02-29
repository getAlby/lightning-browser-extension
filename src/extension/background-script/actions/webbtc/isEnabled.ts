import { getHostFromSender } from "~/common/utils/helpers";
import db from "~/extension/background-script/db";
import type { MessageAllowanceEnable, Sender } from "~/types";

import state from "../../state";

const isEnabled = async (message: MessageAllowanceEnable, sender: Sender) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  const isUnlocked = await state.getState().isUnlocked();
  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  const enabledFor = new Set(allowance?.enabledFor);

  if (
    isUnlocked &&
    allowance &&
    allowance.enabled &&
    enabledFor.has("webbtc")
  ) {
    return {
      data: { isEnabled: true },
    };
  } else {
    return {
      data: { isEnabled: false },
    };
  }
};

export default isEnabled;
