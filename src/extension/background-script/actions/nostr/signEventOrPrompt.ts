import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import { DbPermission, MessageSignEvent } from "~/types";

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

  const dbPermissions = await db.permissions
    .where("host")
    .equalsIgnoreCase(message.origin.host)
    .toArray();

  const hasPermission = dbPermissions
    .filter((permission) => permission.enabled)
    .map(({ method }) => method)
    .includes("signMessage");

  console.log({ hasPermission });

  try {
    if (!hasPermission) {
      const response = await utils.openPrompt<{
        confirm: boolean;
        rememberPermission: boolean;
      }>({
        ...message,
        action: "public/nostr/confirmSignMessage",
      });

      if (!response.data.confirm) {
        throw new Error("User rejected");
      }

      if (response.data.rememberPermission) {
        const matchingAllowance = await db.allowances
          .where("host")
          .equalsIgnoreCase(message.origin.host)
          .first();
        const allowanceId = matchingAllowance?.id;

        if (!allowanceId) return; // type-guard only

        const permission: DbPermission = {
          createdAt: Date.now().toString(),
          allowanceId,
          host: message.origin.host,
          method: "signMessage",
          enabled: true,
          blocked: false,
        };

        await db.permissions.add(permission);
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
