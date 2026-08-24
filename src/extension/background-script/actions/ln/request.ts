import pubsub from "~/common/lib/pubsub";
import utils from "~/common/lib/utils";
import { isFundMovingRequestMethod } from "~/extension/background-script/connectors/connector.interface";
import {
  addPermissionFor,
  hasPermissionFor,
} from "~/extension/background-script/permissions";
import { MessageGenericRequest } from "~/types";

import db from "../../db";
import state from "../../state";

const WEBLN_PREFIX = "webln/";

// the request method that sends a payment and therefore has to be accounted
// for in the allowance budget of the host
const SEND_TO_ROUTE = "sendtoroute";

// LND returns int64 values as strings, LNC returns them as numbers. Both the
// REST and the LNC API are called with the parameters the website provides, so
// the keys can be in snake_case or in camelCase.
const readAmount = (
  values: Record<string, unknown>,
  keys: string[],
  divisor = 1
): number | undefined => {
  for (const key of keys) {
    const value = values[key];
    if (typeof value !== "string" && typeof value !== "number") {
      continue;
    }
    const amount = Number(value);
    if (Number.isFinite(amount) && amount >= 0) {
      return Math.ceil(amount / divisor);
    }
  }
};

// the amount that leaves the wallet is the total amount of the route the
// website asks the node to send along. It includes the routing fees.
const getSendToRouteAmount = (params: Record<string, unknown>): number => {
  const route = params?.route;
  if (!route || typeof route !== "object") {
    throw new Error("Could not determine the amount of this request");
  }

  const routeValues = route as Record<string, unknown>;
  const amount =
    readAmount(routeValues, ["total_amt", "totalAmt"]) ??
    readAmount(routeValues, ["total_amt_msat", "totalAmtMsat"], 1000);

  if (amount === undefined) {
    throw new Error("Could not determine the amount of this request");
  }
  return amount;
};

const getSendToRouteDestination = (
  params: Record<string, unknown>
): string | undefined => {
  const hops = (params?.route as Record<string, unknown> | undefined)?.hops;
  if (!Array.isArray(hops) || !hops.length) {
    return;
  }
  const lastHop = hops[hops.length - 1] as Record<string, unknown>;
  const destination = lastHop?.pub_key ?? lastHop?.pubKey;
  return typeof destination === "string" ? destination : undefined;
};

// the response of the node for a sendtoroute call. LNC converts its response to
// snake_case, so both connectors return the same keys here.
type SendToRouteResponse = {
  payment_error?: string;
  payment_preimage?: string;
  payment_hash?: string;
  payment_route?: { total_amt?: number | string; total_fees?: number | string };
};

// publish the payment so that the existing subscribers debit the budget of the
// allowance and persist the payment
const publishSendToRoutePayment = (
  message: MessageGenericRequest,
  accountId: string,
  response: { data: unknown },
  amount: number,
  destination?: string
) => {
  const data = (response.data ?? {}) as SendToRouteResponse;

  if (data.payment_error) {
    pubsub.publishPaymentNotification("sendPayment", message, {
      accountId,
      response: { error: data.payment_error },
      details: {},
    });
    return;
  }

  const route = (data.payment_route ?? {}) as Record<string, unknown>;
  const totalFees = readAmount(route, ["total_fees"]) ?? 0;
  // like the connector `sendPayment` implementations, the published route
  // amount is the amount without the routing fees
  const totalAmount = (readAmount(route, ["total_amt"]) ?? amount) - totalFees;

  pubsub.publishPaymentNotification("sendPayment", message, {
    accountId,
    response: {
      data: {
        preimage: data.payment_preimage ?? "",
        paymentHash: data.payment_hash ?? "",
        route: { total_amt: Math.max(totalAmount, 0), total_fees: totalFees },
      },
    },
    details: { destination },
  });
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

    // the allowance can exist because the host was enabled for another provider
    // (e.g. nostr), requests are only allowed if WebLN is enabled for the host
    if (!allowance.enabled || !allowance.enabledFor?.includes("webln")) {
      throw new Error("WebLN is not enabled for this host");
    }

    if (!accountId) {
      // type guard
      throw new Error("Could not find a selected account");
    }

    const isFundMoving = isFundMovingRequestMethod(methodInLowerCase);
    const isSendToRoute = methodInLowerCase === SEND_TO_ROUTE;

    // throws if the amount can not be read, we never send an unknown amount
    const amount = isSendToRoute
      ? getSendToRouteAmount(args.params)
      : undefined;
    const destination = isSendToRoute
      ? getSendToRouteDestination(args.params)
      : undefined;

    if (amount !== undefined && !(allowance.remainingBudget > amount)) {
      throw new Error("The budget of this website is not sufficient");
    }

    // the connector type of the account, not the name of the connector class:
    // the class name is mangled by the production build, so a permission keyed
    // on it depends on the output of the minifier and the description does not
    // resolve to a translation
    const connectorName = state.getState().getAccount()?.connector;
    if (!connectorName) {
      throw new Error("Could not find a selected account");
    }

    // prefix method with webln to prevent potential naming conflicts (e.g. with nostr calls that also use the permissions)
    const weblnMethod = `${WEBLN_PREFIX}${connectorName}/${methodInLowerCase}`;

    // methods that can move funds are confirmed on every call, a stored
    // permission never skips the prompt for them
    const hasPermission =
      !isFundMoving && (await hasPermissionFor(weblnMethod, origin.host));

    // bound to the connector: the implementations call other methods on
    // themselves, a detached reference loses the receiver
    const requestMethod = connector.requestMethod.bind(connector);
    const callRequestMethod = async () => {
      const response = await requestMethod(methodInLowerCase, args.params);

      if (amount !== undefined) {
        publishSendToRoutePayment(
          message,
          accountId,
          response,
          amount,
          destination
        );
      }

      return response;
    };

    // request method is allowed to be called
    if (hasPermission) {
      return await callRequestMethod();
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
            ...(isFundMoving && { isFundMoving, amount, destination }),
          },
        },
        origin,
        action: "public/confirmRequestPermission",
      });

      const response = await callRequestMethod();

      // add permission to db only if user decided to always allow this request.
      // methods that can move funds are never remembered.
      if (!isFundMoving && promptResponse.data.enabled) {
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
