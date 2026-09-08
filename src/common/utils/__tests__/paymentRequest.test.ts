import lightningPayReq from "bolt11-signet";
import { createPaymentRequest } from "~/fixtures/paymentRequests";

import { getPaymentRequestAmountSats } from "../paymentRequest";

function decode(millisatoshis?: number) {
  return lightningPayReq.decode(createPaymentRequest(millisatoshis));
}

describe("getPaymentRequestAmountSats", () => {
  test("returns the amount for whole-satoshi invoices", () => {
    expect(getPaymentRequestAmountSats(decode(1_000_000))).toBe(1000);
  });

  // an invoice for a non-whole number of sats leaves `satoshis` unset; reading it
  // directly reported a real amount as 0 and bypassed the allowance budget check
  test("returns the amount for sub-satoshi precision invoices", () => {
    expect(getPaymentRequestAmountSats(decode(1_000_500))).toBe(1001);
    expect(getPaymentRequestAmountSats(decode(50_000_001))).toBe(50001);
  });

  test("rounds up so a payment is never under-reported", () => {
    expect(getPaymentRequestAmountSats(decode(999))).toBe(1);
    expect(getPaymentRequestAmountSats(decode(1))).toBe(1);
  });

  test("returns null for amountless invoices", () => {
    expect(getPaymentRequestAmountSats(decode())).toBeNull();
  });

  // an explicit zero amount cannot be paid without the user supplying one, so
  // it must not be treated as a 0 sat payment that fits any budget
  test("returns null for invoices with an explicit zero amount", () => {
    expect(getPaymentRequestAmountSats(decode(0))).toBeNull();
  });
});
