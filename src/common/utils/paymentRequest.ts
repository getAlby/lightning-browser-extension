import lightningPayReq from "bolt11";

export function getPaymentRequestDescription(paymentRequest: string): string {
  const signet = {
    bech32: "tbs",
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    validWitnessVersions: [0],
  };
  const decodedPaymentRequest = lightningPayReq.decode(paymentRequest, signet);
  const descriptionTag = decodedPaymentRequest.tags.find(
    (tag) => tag.tagName === "description"
  );
  return descriptionTag ? descriptionTag.data.toString() : "";
}
