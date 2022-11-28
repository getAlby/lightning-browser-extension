import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import { MessageSignEvent } from "~/types";
import { PermissionMethod } from "~/types";

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

  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(message.origin.host)
    .first();

  if (!allowance?.id) {
    return { error: "Could not find an allowance for this host" };
  }

  const hasPermission = await db.permissions
    .where("host")
    .equalsIgnoreCase(message.origin.host)
    .and(
      (permission) =>
        permission.enabled &&
        permission.method === PermissionMethod["NOSTR_SIGNMESSAGE"]
    )
    .first();

  try {
    if (!hasPermission) {
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
          blocked: true,
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
