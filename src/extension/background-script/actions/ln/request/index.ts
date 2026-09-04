import utils from "~/common/lib/utils";
import {
  addPermissionFor,
  hasPermissionFor,
} from "~/extension/background-script/permissions";
import { MessageGenericRequest } from "~/types";

import db from "../../../db";
import state from "../../../state";
import { checkAllowance } from "../../webln/sendPaymentOrPrompt";
import addholdinvoice from "./addholdinvoice";
import connectpeer from "./connectpeer";
import disconnectpeer from "./disconnectpeer";
import openchannel from "./openchannel";
import sendtoroute from "./sendtoroute";
import settleinvoice from "./settleinvoice";
import { RequestMethodHandler } from "./types";

const WEBLN_PREFIX = "webln/";

const methods: Record<string, RequestMethodHandler> = {
  addholdinvoice,
  connectpeer,
  disconnectpeer,
  openchannel,
  sendtoroute,
  settleinvoice,
};

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
    const requestMethodName = `request.${methodInLowerCase}`;

    // Check if the current connector support the call
    // connectors maybe do not support `requestMethod` at all
    // connectors also specify a whitelist of supported methods that can be called
    //
    // important: this must throw to exit and return an error
    const supportedMethods = connector.supportedMethods || []; // allow the connector to control which methods can be called
    if (
      !connector.requestMethod ||
      !supportedMethods.includes(requestMethodName)
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

    if (!allowance.enabled || !allowance.enabledFor?.includes("webln")) {
      throw new Error("WebLN is not enabled for this host");
    }

    const connectorName = state.getState().getAccount()?.connector;
    if (!accountId || !connectorName) {
      throw new Error("Could not find a selected account");
    }

    // prefix method with webln to prevent potential naming conflicts (e.g. with nostr calls that also use the permissions)
    const weblnMethod = `${WEBLN_PREFIX}${connectorName}/${methodInLowerCase}`;

    const requestMethod = connector.requestMethod.bind(connector);
    const method = methods[methodInLowerCase];
    const params = method?.getParams(args.params) ?? {};
    const isPayment = Boolean(method?.isPayment);
    const alwaysConfirm = Boolean(method?.alwaysConfirm);

    // budgeting is meaningless without a real amount, so this must throw here —
    // before any permission/budget check or prompt — same as a bad params object
    if (isPayment && params.amount === undefined) {
      throw new Error("Could not determine the amount of this request");
    }

    const execute = async () => {
      const response = await requestMethod(methodInLowerCase, args.params);
      method?.onSuccess?.(message, accountId, response, params);
      return response;
    };

    const hasBudget =
      !isPayment ||
      (await checkAllowance(origin.host, Number(params.amount ?? 0)));
    const hasPermission =
      !alwaysConfirm &&
      hasBudget &&
      (await hasPermissionFor(weblnMethod, origin.host));

    // request method is allowed to be called
    if (hasPermission) {
      return await execute();
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
            ...(alwaysConfirm && { alwaysConfirm }),
            ...(isPayment && { showBudgetControl: !hasBudget }),
            ...(Object.keys(params).length && { params }),
          },
        },
        origin,
        action: "public/confirmRequestPermission",
      });

      const response = await execute();

      // add permission to db only if user decided to always allow this request
      if (!alwaysConfirm && promptResponse.data.enabled) {
        await addPermissionFor(
          weblnMethod,
          origin.host,
          promptResponse.data.blocked
        );
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
