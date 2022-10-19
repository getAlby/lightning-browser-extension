import db from "~/extension/background-script/db";
import type {
  DbAlbyEvent,
  AuthNotificationData, // AlbyEventBudgetUpdateDetails,
  PaymentNotificationData,
} from "~/types";
import { AlbyEventType } from "~/types";

export const persistAlbyEvent = async (
  _message:
    | "albyEvent.auth"
    | "albyEvent.budget.update"
    | "albyEvent.invoice"
    | "albyEvent.transaction",
  data: PaymentNotificationData | AuthNotificationData
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

  const dbAlbyEvent: DbAlbyEvent = {
    createdAt: Date.now().toString(),
    event,
    details: JSON.stringify(eventDetails),
  };

  await db.albyEvents.add(dbAlbyEvent);
};
