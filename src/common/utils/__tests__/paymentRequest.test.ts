import lightningPayReq from "bolt11-signet";

import { getPaymentRequestAmountSats } from "../paymentRequest";

// a fixed key so the generated invoices are stable across runs
const PRIVATE_KEY = Buffer.from(
  "e126f68f7eafcc8b74f54d269fe206be715000f94dac067d1c04a8ca3b2db734",
  "hex"
);

function createPaymentRequest(millisatoshis?: number) {
  const encoded = lightningPayReq.encode({
    ...(millisatoshis !== undefined && {
      millisatoshis: String(millisatoshis),
    }),
    tags: [
      {
        tagName: "payment_hash",
        data: "0001020304050607080900010203040506070809000102030405060708090102",
      },
      { tagName: "description", data: "test" },
    ],
  });
  const { paymentRequest } = lightningPayReq.sign(encoded, PRIVATE_KEY);
  if (!paymentRequest) {
    throw new Error("Failed to encode payment request");
  }
  return paymentRequest;
}

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
});
