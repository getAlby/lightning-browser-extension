import lightningPayReq from "bolt11-signet";

export function getPaymentRequestDescription(paymentRequest: string): string {
  const decodedPaymentRequest = lightningPayReq.decode(paymentRequest);
  const descriptionTag = decodedPaymentRequest.tags.find(
    (tag) => tag.tagName === "description"
  );
  return descriptionTag ? descriptionTag.data.toString() : "";
}
