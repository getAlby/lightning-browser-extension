import utils from "~/common/lib/utils";
import enable from "~/extension/background-script/actions/allowances/enable";
import db from "~/extension/background-script/db";
import {
  MessageAllowanceEnable,
  DbPermission,
  MessageSignEvent,
} from "~/types";

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

  const enableMessage: MessageAllowanceEnable = {
    origin: message.origin, // TODO: make sure we pass the image as well
    args: {
      host: message.origin.host,
    },
    action: "public/webln/enable",
  };

  const foo = await enable(enableMessage);
  console.log("after enbale <----", foo);

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

      // if (!allowanceId) {
      //   console.log("mno matching allowance");

      //   const dbAllowance: DbAllowance = {
      //     createdAt: Date.now().toString(),
      //     enabled: true,
      //     host: message.origin.host,
      //     imageURL: "", // need to get the image
      //     lastPaymentAt: 0,
      //     lnurlAuth: false,
      //     name: "",
      //     remainingBudget: 0,
      //     tag: "",
      //     totalBudget: 0,
      //   };
      //   allowanceId = await db.allowances.add(dbAllowance);
      // }

      console.log("matching allowance!");

      if (response.data.rememberPermission) {
        const matchingAllowance = await db.allowances
          .where("host")
          .equalsIgnoreCase(message.origin.host)
          .first();
        const allowanceId = matchingAllowance?.id;

        if (!allowanceId) return; // type-guard only

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
