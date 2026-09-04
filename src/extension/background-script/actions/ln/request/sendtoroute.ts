import pubsub from "~/common/lib/pubsub";
import utils from "~/common/lib/utils";
import { MessageGenericRequest } from "~/types";

import { RequestMethodHandler, RequestParams } from "./types";

type RouteHop = {
  pub_key?: unknown;
  pubKey?: unknown;
};

type Route = {
  total_amt?: unknown;
  totalAmt?: unknown;
  total_amt_msat?: unknown;
  totalAmtMsat?: unknown;
  hops?: RouteHop[];
};

type SendToRouteResponse = {
  payment_error?: string;
  payment_preimage?: string;
  payment_hash?: string;
  payment_route?: { total_amt?: number | string; total_fees?: number | string };
};

const sendtoroute: RequestMethodHandler = {
  isPayment: true,
  getParams(rawParams) {
    // LND REST is snake_case; LNC gRPC-web is camelCase
    const route = (rawParams.route ?? {}) as Route;
    const lastHop = route.hops?.at(-1) ?? {};

    const sats = toSats(route.total_amt ?? route.totalAmt);
    const msats = toSats(route.total_amt_msat ?? route.totalAmtMsat, 1000);
    const amount =
      sats !== undefined && msats !== undefined
        ? Math.max(sats, msats)
        : sats ?? msats;
    const pubkey = lastHop.pub_key ?? lastHop.pubKey;

    return {
      ...(amount !== undefined && { amount }),
      ...(typeof pubkey === "string" && pubkey && { pubkey }),
    };
  },
  onSuccess(message, accountId, response, params) {
    publishSendToRoutePayment(message, accountId, response, params);
  },
};

function publishSendToRoutePayment(
  message: MessageGenericRequest,
  accountId: string,
  response: { data: unknown },
  params: RequestParams
) {
  const data = (response.data ?? {}) as SendToRouteResponse;

  if (data.payment_error) {
    pubsub.publishPaymentNotification("sendPayment", message, {
      accountId,
      response: { error: data.payment_error },
      details: {},
    });
    return;
  }

  // request() already guarantees params.amount is set to a validated number
  // before this is ever called
  const amount = Number(params.amount);
  const route = data.payment_route ?? {};
  const totalFees = toSats(route.total_fees) ?? 0;
  const totalAmount = (toSats(route.total_amt) ?? amount) - totalFees;

  pubsub.publishPaymentNotification("sendPayment", message, {
    accountId,
    response: {
      data: {
        preimage: data.payment_preimage
          ? utils.base64ToHex(data.payment_preimage)
          : "",
        paymentHash: data.payment_hash
          ? utils.base64ToHex(data.payment_hash)
          : "",
        route: { total_amt: Math.max(totalAmount, 0), total_fees: totalFees },
      },
    },
    details: {
      destination:
        params.pubkey !== undefined ? String(params.pubkey) : undefined,
    },
  });
}

function toSats(value: unknown, divisor = 1): number | undefined {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? Math.ceil(amount / divisor)
    : undefined;
}

export default sendtoroute;
