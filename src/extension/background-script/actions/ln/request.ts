import utils from "~/common/lib/utils";
import { MessageGenericRequest } from "~/types";

import db from "../../db";
import state from "../../state";

const WEBLN_PREFIX = "webln/";

const request = async (
  message: MessageGenericRequest
): Promise<{ data: unknown } | { error: string }> => {
  const connector = await state.getState().getConnector();

  const { origin, args } = message;

  const method = args.method.toLowerCase();

  try {
    // Check if the current connector support the call
    // connectors maybe do not support `requestMethod` at all
    // connectors also specify a whitelist of supported methods that can be called
    //
    // important: this must throw to exit and return an error
    const supportedMethods = connector.supportedMethods || []; // allow the connector to control which methods can be called
    if (!connector.requestMethod || !supportedMethods.includes(method)) {
      throw new Error(`${method} is not supported by your account`);
    }

    const allowance = await db.allowances
      .where("host")
      .equalsIgnoreCase(origin.host)
      .first();

    if (!allowance?.id) {
      return { error: "Could not find an allowance for this host" };
    }

    // prefix method with webln to prevent potential naming conflicts (e.g. with nostr calls that also use the permissions)
    const weblnMethod = `${WEBLN_PREFIX}${method}`;

    const permission = await db.permissions
      .where("host")
      .equalsIgnoreCase(origin.host)
      .and((p) => p.method === weblnMethod)
      .first();

    // request method is allowed to be called
    if (permission && permission.enabled && supportedMethods.includes(method)) {
      const response = await connector.requestMethod(method, args.params);
      return response;
    } else {
      const promptResponse = await utils.openPrompt<{
        enabled: boolean;
        blocked: boolean;
      }>({
        args: {
          requestPermission: {
            method,
            description: `${connector.constructor.name.toLowerCase()}.${method}`,
          },
        },
        origin,
        action: "public/confirmRequestPermission",
      });

      const response = await connector.requestMethod(method, args.params);

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.enabled) {
        const permissionIsAdded = await db.permissions.add({
          createdAt: Date.now().toString(),
          allowanceId: allowance.id,
          host: origin.host,
          method: weblnMethod, // ensure to store the prefixed method string
          enabled: promptResponse.data.enabled,
          blocked: promptResponse.data.blocked,
        });

        !!permissionIsAdded && (await db.saveToStorage());
      }

      return response;
    }
  } catch (e) {
    console.error(e);
    return {
      error:
        e instanceof Error
          ? e.message
          : `Something went wrong with request ${args?.method}`,
    };
  }
};

export default request;
