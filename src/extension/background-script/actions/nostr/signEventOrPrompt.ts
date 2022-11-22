import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import { DbPermission, MessageSignEvent, DbAllowance } from "~/types";

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

  console.log("message.args.event", message.args.event);

  const dbPermissions = await db.permissions
    .where("host")
    .equalsIgnoreCase(message.origin.host)
    .toArray();

  const hasPermission = dbPermissions
    .filter((permission) => permission.enabled)
    .map(({ method }) => method)
    .includes("signMessage");

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

      const matchingAllowance = await db.allowances
        .where("host")
        .equalsIgnoreCase(message.origin.host)
        .first();
      let allowanceId = matchingAllowance?.id;

      if (!allowanceId) {
        console.log("mno matching allowance");

        const dbAllowance: DbAllowance = {
          createdAt: Date.now().toString(),
          enabled: true,
          host: message.origin.host,
          imageURL: "", // need to get the image
          lastPaymentAt: 0,
          lnurlAuth: false,
          name: "",
          remainingBudget: 0,
          tag: "",
          totalBudget: 0,
        };
        allowanceId = await db.allowances.add(dbAllowance);
      }

      console.log("matching allowance!");

      if (response.data.rememberPermission) {
        console.log("rememberme?");

        const permission: DbPermission = {
          createdAt: Date.now().toString(),
          allowanceId,
          host: message.origin.host,
          method: "signMessage",
          enabled: true,
          blocked: false,
        };
        console.log("rememberme!", permission);

        await db.permissions.add(permission);
      }
    }

    console.log("SO HAZ permissions - message: ", message);
    const signedEvent = await state
      .getState()
      .getNostr()
      .signEvent(message.args.event);

    console.log("SO HAZ permissions - signedEvent: ", signedEvent);

    return { data: signedEvent };
  } catch (e) {
    console.error("signEvent cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default signEventOrPrompt;
