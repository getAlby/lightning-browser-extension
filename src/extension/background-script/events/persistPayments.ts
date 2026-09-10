import { getPaymentRequestAmountSats } from "~/common/utils/paymentRequest";
import type { PaymentNotificationData } from "~/types";

import db from "../db";

const persistSuccessfulPayment = async (
  message: "ln.sendPayment.success" | "ln.keysend.success",
  data: PaymentNotificationData
) => {
  const name = data?.origin?.name;
  const host = data?.origin?.host || "";
  const location = data?.origin?.location;
  const accountId = data.accountId;
  const paymentResponse = data.response;

  if ("error" in paymentResponse) {
    return;
  }

  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host as string)
    .first();

  const route = paymentResponse.data.route;
  const total_amt =
    (data.paymentRequestDetails &&
      getPaymentRequestAmountSats(data.paymentRequestDetails)) ??
    route.total_amt;
  const { total_fees } = route;

  await db.payments.add({
    accountId,
    host,
    location,
    name,
    description: data.details.description as string,
    preimage: paymentResponse.data.preimage,
    paymentHash: paymentResponse.data.paymentHash,
    destination: data.details.destination as string,
    totalAmount: total_amt,
    totalFees: total_fees,
    createdAt: Date.now().toString(),
    allowanceId: allowance ? (allowance.id ?? "").toString() : "",
    paymentRequest: "",
  });
  if (allowance?.id) {
    await db.allowances.update(allowance.id, { lastPaymentAt: Date.now() });
  }
  await db.saveToStorage();
  console.info(`Persisted payment ${paymentResponse.data.paymentHash}`);
  return true;
};

export { persistSuccessfulPayment };
