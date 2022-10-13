import db from "~/extension/background-script/db";
import {
  DbAlbyEvent,
  LNURLAuthServiceResponse,
  AlbyEventType,
  AlbyEventBudgetUpdateDetails,
} from "~/types";

export const persistAlbyEvent = async (
  _message: "albyEvent.auth" | "albyEvent.budget.update",
  data: {
    details: LNURLAuthServiceResponse | AlbyEventBudgetUpdateDetails;
    event: AlbyEventType;
  }
) => {
  const { details, event } = data;

  const dbAlbyEvent: DbAlbyEvent = {
    createdAt: Date.now().toString(),
    event,
    details: JSON.stringify(details),
  };

  await db.albyEvents.add(dbAlbyEvent);
};
