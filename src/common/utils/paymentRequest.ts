import { Invoice } from "@getalby/lightning-tools";

// The decode-only subset of a BOLT11 invoice the extension actually reads. It is
// a plain, serialisable object (unlike the `Invoice` class, which carries
// methods) so it can travel through pubsub messages and be built in tests.
export interface PaymentRequestDetails {
  paymentRequest: string;
  // BOLT11 amounts are millisatoshi-precision. `satoshi` is the fractional
  // amount (millisatoshi / 1000) and is only safe to display, never to compare
  // against a budget — read `millisatoshi` for that.
  satoshi: number;
  millisatoshi: number;
  // seconds since the epoch
  timestamp: number;
  // seconds relative to `timestamp`, when present
  expiry?: number;
  description: string | null;
  paymentHash: string;
}

// Decodes a BOLT11 invoice. Prefix-agnostic, so signet (`lntbs…`) invoices
// decode too. Throws for an invalid invoice, so call sites can rely on it to
// reject malformed input.
export function decodeInvoice(paymentRequest: string): PaymentRequestDetails {
  const invoice = new Invoice({ pr: paymentRequest });
  return {
    paymentRequest: invoice.paymentRequest,
    satoshi: invoice.satoshi,
    millisatoshi: invoice.millisatoshi,
    timestamp: invoice.timestamp,
    expiry: invoice.expiry,
    description: invoice.description,
    paymentHash: invoice.paymentHash,
  };
}

// BOLT11 amounts are millisatoshi-precision: an invoice for 1000.5 sat decodes
// to `millisatoshi: 1000500`. Reading a rounded/whole-sat amount instead would
// report a real amount as 0, so read `millisatoshi`. Rounds up so we never
// under-report what is being spent. Returns null for amountless invoices (no
// amount, or an explicit zero amount), which cannot be checked against a budget.
export function getPaymentRequestAmountSats(
  paymentRequestDetails: Pick<PaymentRequestDetails, "millisatoshi">
): number | null {
  const { millisatoshi } = paymentRequestDetails;
  if (!millisatoshi) {
    return null;
  }
  return Math.ceil(millisatoshi / 1000);
}

export function getPaymentRequestDescription(paymentRequest: string): string {
  return decodeInvoice(paymentRequest).description ?? "";
}
