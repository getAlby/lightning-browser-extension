import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import { MessageSignEvent, PermissionMethod } from "~/types";

import state from "../../state";
import { validateEvent } from "./helpers";

const signEventOrPrompt = async (message: MessageSignEvent) => {
  if (!("host" in message.origin)) {
    console.error("error", message.origin);
    return;
  }

  if (!validateEvent(message.args.event)) {
    console.error("Invalid event");
    return {
      error: "Invalid event.",
    };
  }

  const allowance = await db.allowances.get({
    host: message.origin.host,
  });

  if (!allowance?.id) {
    return { error: "Could not find an allowance for this host" };
  }

  const findPermission = await db.permissions.get({
    host: message.origin.host,
    method: PermissionMethod["NOSTR_SIGNMESSAGE"],
  });

  const hasPermission = !!findPermission?.enabled;

  try {
    if (hasPermission) {
      const signedEvent = await state
        .getState()
        .getNostr()
        .signEvent(message.args.event);
      return { data: signedEvent };
    } else {
      const promptResponse = await utils.openPrompt<{
        confirm: boolean;
        rememberPermission: boolean;
      }>({
        ...message,
        action: "public/nostr/confirmSignMessage",
      });

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.rememberPermission) {
        const permissionIsAdded = await db.permissions.add({
          createdAt: Date.now().toString(),
          allowanceId: allowance.id,
          host: message.origin.host,
          method: PermissionMethod["NOSTR_SIGNMESSAGE"],
          enabled: true,
          blocked: false,
        });

        !!permissionIsAdded && (await db.saveToStorage());
      }
      if (promptResponse.data.confirm) {
        // Normally `openPrompt` would throw already, but to make sure we got a confirm from the user we check this here
        const signedEvent = await state
          .getState()
          .getNostr()
          .signEvent(message.args.event);
        return { data: signedEvent };
      } else {
        return { error: "User rejected" };
      }
    }
  } catch (e) {
    console.error("signEvent failed", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default signEventOrPrompt;
