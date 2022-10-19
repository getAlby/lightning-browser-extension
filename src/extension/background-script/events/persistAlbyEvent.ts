import db from "~/extension/background-script/db";
import type {
  DbAlbyEvent,
  AuthNotificationData, // AlbyEventBudgetUpdateDetails,
  PaymentNotificationData,
  AlbyEventInvoiceDetails,
} from "~/types";
import { AlbyEventType } from "~/types";

export const persistAlbyEvent = async (
  _message:
    | "lnurl.auth.success"
    // | "albyEvent.budget.update"
    | "ln.makeInvoice.success"
    | "ln.sendPayment.success",
  data: PaymentNotificationData | AuthNotificationData | AlbyEventInvoiceDetails
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

  const dbAlbyEvent: DbAlbyEvent = {
    createdAt: Date.now().toString(),
    event,
    details: JSON.stringify(eventDetails),
  };

  await db.albyEvents.add(dbAlbyEvent);
};
