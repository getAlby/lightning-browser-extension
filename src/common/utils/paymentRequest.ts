import lightningPayReq, { PaymentRequestObject } from "bolt11-signet";

// BOLT11 amounts are millisatoshi-precision, but `satoshis` is only set when the
// invoice amount is a whole number of sats — an invoice for 1000.5 sat decodes to
// `satoshis: undefined, millisatoshis: "1000500"`. Reading `satoshis` alone (or
// `satoshis || 0`) therefore reads a real amount as 0, so read millisatoshis,
// which is always set alongside it. Rounds up so we never under-report what is
// being spent. Returns null for amountless invoices (no amount, or an explicit
// zero amount), which cannot be checked against a budget.
export function getPaymentRequestAmountSats(
  paymentRequestDetails: PaymentRequestObject
): number | null {
  const millisatoshis = Number(paymentRequestDetails.millisatoshis);
  if (!millisatoshis) {
    return null;
  }
  return Math.ceil(millisatoshis / 1000);
}

export function getPaymentRequestDescription(paymentRequest: string): string {
  const decodedPaymentRequest = lightningPayReq.decode(paymentRequest);
  const descriptionTag = decodedPaymentRequest.tags.find(
    (tag) => tag.tagName === "description"
  );
  return descriptionTag ? descriptionTag.data.toString() : "";
}
