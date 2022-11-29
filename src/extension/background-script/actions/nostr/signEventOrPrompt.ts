import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import { MessageSignEvent } from "~/types";
import { PermissionMethodNostr } from "~/types";

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
    method: PermissionMethodNostr["NOSTR_SIGNMESSAGE"],
  });

  const hasPermission = !!findPermission?.enabled;

  try {
    if (!hasPermission) {
      const promptResponse = await utils.openPrompt<{
        enabled: boolean;
        blocked: boolean;
      }>({
        ...message,
        action: "public/nostr/confirmSignMessage",
      });

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.enabled) {
        const permissionIsAdded = await db.permissions.add({
          createdAt: Date.now().toString(),
          allowanceId: allowance.id,
          host: message.origin.host,
          method: PermissionMethodNostr["NOSTR_SIGNMESSAGE"],
          enabled: promptResponse.data.enabled,
          blocked: promptResponse.data.blocked,
        });

        !!permissionIsAdded && (await db.saveToStorage());
      }
    }

    const signedEvent = await state
      .getState()
      .getNostr()
      .signEvent(message.args.event);

    return { data: signedEvent };
  } catch (e) {
    console.error("signEvent cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default signEventOrPrompt;
