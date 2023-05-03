import utils from "~/common/lib/utils";
import { Message } from "~/types";

export default async function promptAddAccount(message: Message) {
  try {
    await utils.openPrompt({
      ...message,
      action: "confirmAddAccount",
    });
    return { data: true };
  } catch (e) {
    console.error("Adding account cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
}
