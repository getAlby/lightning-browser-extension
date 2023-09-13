import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import db from "~/extension/background-script/db";
import type { MessageAllowanceEnable, Sender } from "~/types";

import state from "../../../state";
import { ExtensionIcon, setIcon } from "../../setup/setIcon";

const nostrEnable = async (message: MessageAllowanceEnable, sender: Sender) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  const isUnlocked = await state.getState().isUnlocked();
  const account = await state.getState().getAccount();
  const allowance = await db.allowances

    .where("host")
    .equalsIgnoreCase(host)
    .first();
  // remove this? cause next time the allowance is set and enable is called we directly return from here.hence onboarding will work only once
  // i suggest to not remove it. as if we go to the screen everytime. for other providers. it will be a flickering glitch.
  // screen will popup for a second and close automatically as allowance is set but we are returning from the screen if we remove it.
  if (
    isUnlocked &&
    allowance &&
    allowance.enabled &&
    account?.nostrPrivateKey
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

export default nostrEnable;
