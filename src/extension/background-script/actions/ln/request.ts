import utils from "~/common/lib/utils";
import { MessageGenericRequest } from "~/types";

import db from "../../db";
import state from "../../state";

const WEBLN_PREFIX = "webln/";

const request = async (
  message: MessageGenericRequest
): Promise<{ data: unknown } | { error: string }> => {
  const connector = await state.getState().getConnector();
  const accountId = state.getState().currentAccountId;

  const { origin, args } = message;

  try {
    // // check first if method exists, otherwise toLowerCase() will fail with a TypeError
    if (!args.method || typeof args.method !== "string") {
      throw new Error("Request method is missing or not correct");
    }

    const methodInLowerCase = args.method.toLowerCase();

    // Check if the current connector support the call
    // connectors maybe do not support `requestMethod` at all
    // connectors also specify a whitelist of supported methods that can be called
    //
    // important: this must throw to exit and return an error
    const supportedMethods = connector.supportedMethods || []; // allow the connector to control which methods can be called
    if (
      !connector.requestMethod ||
      !supportedMethods.includes(methodInLowerCase)
    ) {
      throw new Error(`${methodInLowerCase} is not supported by your account`);
    }

    const allowance = await db.allowances
      .where("host")
      .equalsIgnoreCase(origin.host)
      .first();

    if (!allowance?.id) {
      throw new Error("Could not find an allowance for this host");
    }

    if (!accountId) {
      // type guard
      throw new Error("Could not find a selected account");
    }

    const connectorName = connector.constructor.name.toLowerCase();
    // prefix method with webln to prevent potential naming conflicts (e.g. with nostr calls that also use the permissions)
    const weblnMethod = `${WEBLN_PREFIX}${connectorName}/${methodInLowerCase}`;

    const permission = await db.permissions
      .where("host")
      .equalsIgnoreCase(origin.host)
      .and((p) => p.accountId === accountId && p.method === weblnMethod)
      .first();

    // request method is allowed to be called
    if (
      permission &&
      permission.enabled &&
      supportedMethods.includes(methodInLowerCase)
    ) {
      const response = await connector.requestMethod(
        methodInLowerCase,
        args.params
      );
      return response;
    } else {
      // throws an error if the user rejects
      const promptResponse = await utils.openPrompt<{
        enabled: boolean;
        blocked: boolean;
      }>({
        args: {
          requestPermission: {
            method: methodInLowerCase,
            description: `${connectorName}.${methodInLowerCase}`,
          },
        },
        origin,
        action: "public/confirmRequestPermission",
      });

      const response = await connector.requestMethod(
        methodInLowerCase,
        args.params
      );

      // add permission to db only if user decided to always allow this request
      if (promptResponse.data.enabled) {
        const permissionIsAdded = await db.permissions.add({
          createdAt: Date.now().toString(),
          accountId: accountId,
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
