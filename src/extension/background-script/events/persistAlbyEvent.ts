import db from "~/extension/background-script/db";
import type {
  AlbyEventBudgetUpdateDetails,
  AlbyEventInvoiceDetails,
  AuthNotificationData,
  DbAlbyEvent,
  PaymentNotificationData,
} from "~/types";
import { AlbyEventType } from "~/types";

export const persistAlbyEvent = async (
  _message:
    | "budget.success"
    | "ln.makeInvoice.success"
    | "ln.sendPayment.success"
    | "lnurl.auth.success",
  data:
    | AlbyEventBudgetUpdateDetails
    | AlbyEventInvoiceDetails
    | AuthNotificationData
    | PaymentNotificationData
) => {
  const { event } = data;
  let eventDetails;

  if (event === AlbyEventType.TRANSACTION) {
    const { response, details, paymentRequestDetails, origin } = data;

    eventDetails = {
      response,
      details,
      paymentRequestDetails,
      origin,
    };
  }

  if (event === AlbyEventType.AUTH) {
    const { authResponse, lnurlDetails, origin } = data;

    eventDetails = { authResponse, lnurlDetails, origin };
  }

  if (event === AlbyEventType.INVOICE) {
    const { paymentRequest, rHash } = data;

    eventDetails = { paymentRequest, rHash };
  }

  if (event === AlbyEventType.BUDGET) {
    const { type, allowanceId } = data;

    eventDetails = { type, allowanceId };
  }

  const dbAlbyEvent: DbAlbyEvent = {
    createdAt: Date.now().toString(),
    event,
    details: JSON.stringify(eventDetails),
  };

  await db.albyEvents.add(dbAlbyEvent);
  await db.saveToStorage();
};
