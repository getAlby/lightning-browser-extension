import db from "~/extension/background-script/db";
import { DbAlbyEvent, AlbyEventType, AuthNotificationData } from "~/types";

export const persistAlbyEvent = async (
  message: "lnurl.auth.success",
  data: AuthNotificationData
) => {
  let event;

  if (message === "lnurl.auth.success") {
    event = AlbyEventType.AUTH;
  }

  if (!event) return;

  const { lnurlDetails } = data;

  const dbAlbyEvent: DbAlbyEvent = {
    createdAt: Date.now().toString(),
    event,
    details: JSON.stringify(lnurlDetails),
  };

  await db.albyEvents.add(dbAlbyEvent);
};
