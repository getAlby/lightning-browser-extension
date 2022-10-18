import type { PaymentNotificationData } from "~/types";
import { AlbyEventType, DbPayment } from "~/types";

import db from "../db";

const persistSuccessfullPayment = async (
  message: "ln.sendPayment.success",
  data: PaymentNotificationData
) => {
  const paymentResponse = data.response;
  if ("error" in paymentResponse) {
    return;
  }

  const route = paymentResponse.data.route;
  const { total_amt, total_fees } = route;
  const name = data?.origin?.name;
  const host = data?.origin?.host;
  const location = data?.origin?.location;

  const payment: DbPayment = {
    paymentRequest: data.paymentRequestDetails?.paymentRequest
      ? data.paymentRequestDetails?.paymentRequest
      : "",
    createdAt: Date.now().toString(),
    description: data.details.description ? data.details.description : "",
    destination: data.details.destination ? data.details.destination : "",
    host,
    location,
    name,
    paymentHash: paymentResponse.data.paymentHash,
    preimage: paymentResponse.data.preimage,
    totalAmount: total_amt,
    totalFees: total_fees,
  };

  await db.payments.add(payment);
  await db.saveToStorage();
  console.info(`Persisted payment ${paymentResponse.data.paymentHash}`);

  PubSub.publish("albyEvent.transaction", {
    event: AlbyEventType.TRANSACTION,
    details: payment,
  });

  return true;
};

export { persistSuccessfullPayment };
