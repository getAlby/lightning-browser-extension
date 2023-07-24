import utils from "~/common/lib/utils";
import { Message } from "~/types";

export default async function promptAddAccount(message: Message) {
  if (typeof message.args.name !== "string") {
    return {
      error: "Name missing.",
    };
  }

  if (typeof message.args.connector !== "string") {
    return {
      error: "Connector missing.",
    };
  }

  if (typeof message.args.config !== "object") {
    return {
      error: "Config missing.",
    };
  }

  try {
    await utils.openPrompt({
      ...message,
      action: "confirmAddAccount",
    });
    return { data: { success: true } };
  } catch (e) {
    console.error("Adding account cancelled", e);
    if (e instanceof Error) {
      return { success: false, error: e.message };
    }
    return { success: false };
  }
}
