import { Runtime } from "webextension-polyfill";
import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import type { MessageAllowanceEnable } from "~/types";

import state from "../../state";
import { setIcon, ExtensionIcon } from "../setup/setIcon";

const enable = async (
  message: MessageAllowanceEnable,
  sender: Runtime.MessageSender
) => {
  const isUnlocked = state.getState().isUnlocked();
  const host = message.origin.host || message.args.host;
  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (isUnlocked && allowance && allowance.enabled) {
    return {
      data: { enabled: true },
    };
  } else {
    try {
      const response = await utils.openPrompt<{
        enabled: boolean;
        remember: boolean;
      }>(message);

      if (response.data.enabled && sender.tab) {
        await setIcon(ExtensionIcon.Active, sender.tab.id as number); // highlight the icon when enabled
      }

      // if the response should be saved/remembered we update the allowance for the domain
      // as this returns a promise we must wait until it resolves
      if (response.data.enabled && response.data.remember) {
        if (allowance) {
          if (!allowance.id) {
            return { data: { error: "id is missing" } };
          }
          await db.allowances.update(allowance.id, {
            enabled: true,
            name: message.origin.name,
            imageURL: message.origin.icon,
          });
        } else {
          await db.allowances.add({
            host: host,
            name: message.origin.name,
            imageURL: message.origin.icon,
            enabled: true,
            lastPaymentAt: 0,
            totalBudget: 0,
            remainingBudget: 0,
            createdAt: Date.now().toString(),
            lnurlAuth: false,
            tag: "",
          });
        }
        await db.saveToStorage();
      }
      return {
        data: {
          enabled: response.data.enabled,
          remember: response.data.remember,
        },
      };
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        return { error: e.message };
      }
    }
  }
};

export default enable;
