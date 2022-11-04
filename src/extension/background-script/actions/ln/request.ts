import { Message, OriginData } from "~/types";

import db from "../../db";
import state from "../../state";

const request = async (message: Message) => {
  const connector = await state.getState().getConnector();
  let response;
  try {
    if (!connector.requestMethod) {
      throw new Error(
        `${message.args.method} is not supported by your account`
      );
    }

    const { method, params } = message.args;
    const host = (message.origin as OriginData).host;
    // TODO: validate host, method, params

    const allowance = await db.allowances
      .where("host")
      .equalsIgnoreCase(host as string)
      .first();

    if (!allowance?.id) {
      return { error: "Host not enabled" };
    }

    const permission = await db.permissions
      .where("host")
      .equalsIgnoreCase(host as string) // or rather get by allowanceID?
      .and((p) => p.method === method)
      .first();

    if (permission && permission.enabled) {
      response = await connector.requestMethod(method as string, params);
    } else {
      // prompt the user
      console.error("TODO: missing prompt");
      response = await connector.requestMethod(method as string, params);
      await db.permissions.add({
        createdAt: Date.now().toString(),
        allowanceId: allowance.id,
        host: host as string,
        method: method as string,
        enabled: true,
        blocked: false,
      });
      await db.saveToStorage();
    }
  } catch (e) {
    console.error(e);
    response = {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }
  return response;
};

export default request;
