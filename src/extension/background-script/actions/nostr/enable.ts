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
            enabledFor,
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
          // Add permissions
          const permissions: PermissionMethodNostr[] = [
            PermissionMethodNostr.NOSTR_GETPUBLICKEY,
            PermissionMethodNostr.NOSTR_NIP04ENCRYPT,
            PermissionMethodNostr.NOSTR_NIP04DECRYPT,
            PermissionMethodNostr.NOSTR_NIP44ENCRYPT,
            PermissionMethodNostr.NOSTR_NIP44DECRYPT,
          ];
          permissions.forEach(async (permission) => {
            await addPermissionFor(permission, host);
          });

          // Add specific signing permissions
          const reasonableEventKindIds = [
            0, // Update profile
            1, // Short text note
            4, // Encrypted direct messages
            7, // Reaction
            9734, // Zap request
            10002, // Relay list metadata
            22242, // Client relay authentication
            30023, // Long-form content
            30008, // Manage profile badges
            30009, // Badge definition
          ];
          reasonableEventKindIds.forEach(async (kindId) => {
            await addPermissionFor(
              PermissionMethodNostr.NOSTR_SIGNMESSAGE + "/" + kindId,
              host
            );
          });
        } else if (response.data.preset === NostrPermissionPreset.TRUST_FULLY) {
          Object.values(PermissionMethodNostr).forEach(async (permission) => {
            await addPermissionFor(permission, host);
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
