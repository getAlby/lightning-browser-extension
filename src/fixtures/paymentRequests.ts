import lightningPayReq from "bolt11-signet";

// a fixed key so the generated invoices are stable across runs
const PRIVATE_KEY = Buffer.from(
  "e126f68f7eafcc8b74f54d269fe206be715000f94dac067d1c04a8ca3b2db734",
  "hex"
);

// creates a signed BOLT11 invoice; omit `millisatoshis` for an amountless one
export function createPaymentRequest(millisatoshis?: number) {
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
