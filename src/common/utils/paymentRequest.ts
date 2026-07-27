import lightningPayReq, { PaymentRequestObject } from "bolt11-signet";

// BOLT11 amounts are millisatoshi-precision, but `satoshis` is only set when the
// invoice amount is a whole number of sats — an invoice for 1000.5 sat decodes to
// `satoshis: undefined, millisatoshis: "1000500"`. Reading `satoshis` alone (or
// `satoshis || 0`) therefore reads a real amount as 0, so always fall back to
// millisatoshis. Rounds up so we never under-report what is being spent.
// Returns null for amountless invoices, which carry no amount at all.
export function getPaymentRequestAmountSats(
  paymentRequestDetails: PaymentRequestObject
): number | null {
  if (typeof paymentRequestDetails.satoshis === "number") {
    return paymentRequestDetails.satoshis;
  }
  if (paymentRequestDetails.millisatoshis) {
    return Math.ceil(Number(paymentRequestDetails.millisatoshis) / 1000);
  }
  return null;
}

export function getPaymentRequestDescription(paymentRequest: string): string {
  const decodedPaymentRequest = lightningPayReq.decode(paymentRequest);
  const descriptionTag = decodedPaymentRequest.tags.find(
    (tag) => tag.tagName === "description"
  );
  return descriptionTag ? descriptionTag.data.toString() : "";
}
