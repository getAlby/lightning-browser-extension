import type { PaymentNotificationData } from "~/types";
import { DbAuditLogEntry, DbPayment } from "~/types";
import { AuditLogEntryType } from "~/types";

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

  const paymentId = await db.payments.add(payment);

  const dbAuditLogEntry: DbAuditLogEntry = {
    createdAt: Date.now().toString(),
    event: AuditLogEntryType.TRANSACTION,
    details: JSON.stringify({ paymentId }),
  };

  await db.auditLogEntries.add(dbAuditLogEntry);

  await db.saveToStorage();
  console.info(`Persisted payment ${paymentResponse.data.paymentHash}`);

  return true;
};

export { persistSuccessfullPayment };
