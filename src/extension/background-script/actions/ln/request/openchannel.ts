import { RequestMethodHandler } from "./types";

const openchannel: RequestMethodHandler = {
  alwaysConfirm: true,
  getParams(rawParams) {
    // LND REST is snake_case; LNC gRPC-web is camelCase
    const sats = toSats(
      rawParams.local_funding_amount ?? rawParams.localFundingAmount
    );
    const msats = toSats(
      rawParams.local_funding_amount_msat ?? rawParams.localFundingAmountMsat,
      1000
    );
    const amount =
      sats !== undefined && msats !== undefined
        ? Math.max(sats, msats)
        : sats ?? msats;
    const pubkey =
      rawParams.node_pubkey_string ??
      rawParams.nodePubkeyString ??
      rawParams.node_pubkey ??
      rawParams.nodePubkey;

    return {
      ...(amount !== undefined && { amount }),
      ...(typeof pubkey === "string" && pubkey && { pubkey }),
    };
  },
};

function toSats(value: unknown, divisor = 1): number | undefined {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? Math.ceil(amount / divisor)
    : undefined;
}

export default openchannel;
