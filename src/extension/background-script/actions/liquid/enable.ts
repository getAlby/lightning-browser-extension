import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import db from "~/extension/background-script/db";
import type { MessageAllowanceEnable, Sender } from "~/types";

import state from "../../state";
import { ExtensionIcon, setIcon } from "../setup/setIcon";

const enable = async (message: MessageAllowanceEnable, sender: Sender) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  const isUnlocked = await state.getState().isUnlocked();
  const account = await state.getState().getAccount();
  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  const enabledFor = new Set(allowance?.enabledFor);

  if (!isUnlocked) {
    try {
      await utils.openPrompt<{ unlocked: boolean }>({
        args: {},
        origin: { internal: true },
        action: "unlock",
      });
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        return { error: e.message };
      }
    }
  }

  if (
    allowance &&
    allowance.enabled &&
    account?.mnemonic &&
    enabledFor.has("liquid")
  ) {
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

          enabledFor.add("liquid");

          await db.allowances.update(allowance.id, {
            enabled: true,
            enabledFor,
            name: message.origin.name,
            imageURL: message.origin.icon,
          });
        } else {
          await db.allowances.add({
            host: host,
            name: message.origin.name,
            imageURL: message.origin.icon,
            enabled: true,
            enabledFor: ["liquid"],
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
