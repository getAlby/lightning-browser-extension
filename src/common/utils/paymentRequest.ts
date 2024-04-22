import { decodeLightningInvoice } from "~/app/utils";

export function getPaymentRequestDescription(paymentRequest: string): string {
  const decodedPaymentRequest = decodeLightningInvoice(paymentRequest);
  const descriptionTag = decodedPaymentRequest.tags.find(
    (tag) => tag.tagName === "description"
  );
  return descriptionTag ? descriptionTag.data.toString() : "";
}
