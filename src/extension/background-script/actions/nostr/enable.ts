import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import db from "~/extension/background-script/db";
import {
  NostrPermissionPreset,
  PermissionMethodNostr,
  type MessageAllowanceEnable,
  type Sender,
} from "~/types";

import { addPermissionFor } from "~/extension/background-script/permissions";
import {
  REASONABLE_PRESET_EVENT_KINDS,
  REASONABLE_PRESET_METHODS,
  TRUST_FULLY_PRESET_METHODS,
} from "~/common/utils/nostrPresets";
import state from "../../state";
import { ExtensionIcon, setIcon } from "../setup/setIcon";

const enable = async (message: MessageAllowanceEnable, sender: Sender) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  let isUnlocked = await state.getState().isUnlocked();
  const account = await state.getState().getAccount();
  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  const enabledFor = new Set(allowance?.enabledFor);

  if (!isUnlocked) {
    try {
      const response = await utils.openPrompt<{ unlocked: boolean }>({
        args: {},
        origin: { internal: true },
        action: "unlock",
      });

      isUnlocked = response.data.unlocked;
    } catch (e) {
      if (e instanceof Error) {
        return { error: e.message };
      } else {
        return { error: "Failed to unlock" };
      }
    }
  }

  if (
    isUnlocked &&
    allowance &&
    allowance.enabled &&
    account?.nostrPrivateKey &&
    enabledFor.has("nostr")
  ) {
    return {
      data: { enabled: true },
    };
  } else {
    try {
      const response = await utils.openPrompt<{
        enabled: boolean;
        remember: boolean;
        preset: string;
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

          enabledFor.add("nostr");

          await db.allowances.update(allowance.id, {
            enabled: true,
            enabledFor: Array.from(enabledFor),
            name: message.origin.name,
            imageURL: message.origin.icon,
          });
        } else {
          await db.allowances.add({
            host: host,
            name: message.origin.name,
            imageURL: message.origin.icon,
            enabledFor: ["nostr"],
            enabled: true,
            lastPaymentAt: 0,
            totalBudget: 0,
            remainingBudget: 0,
            createdAt: Date.now().toString(),
            lnurlAuth: false,
            tag: "",
          });
        }
        if (response.data.preset === NostrPermissionPreset.REASONABLE) {
          const permissions: string[] = [
            ...REASONABLE_PRESET_METHODS,
            ...REASONABLE_PRESET_EVENT_KINDS.map(
              (kindId) => `${PermissionMethodNostr.NOSTR_SIGNMESSAGE}/${kindId}`
            ),
          ];
          await Promise.all(
            permissions.map((permission) =>
              addPermissionFor(permission, host, false)
            )
          );
        } else if (response.data.preset === NostrPermissionPreset.TRUST_FULLY) {
          await Promise.all(
            TRUST_FULLY_PRESET_METHODS.map((permission) =>
              addPermissionFor(permission, host, false)
            )
          );
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
