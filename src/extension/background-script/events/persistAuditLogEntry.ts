import db from "~/extension/background-script/db";
import type {
  AuditLogEntryBudgetUpdateDetails,
  AuditLogEntryInvoiceDetails,
  AuthNotificationData,
  DbAuditLogEntry,
} from "~/types";
import { AuditLogEntryType } from "~/types";

export const persistAuditLogEntry = async (
  _message: "budget.success" | "ln.makeInvoice.success" | "lnurl.auth.success",
  data:
    | AuditLogEntryBudgetUpdateDetails
    | AuditLogEntryInvoiceDetails
    | AuthNotificationData
) => {
  const { event } = data;
  let eventDetails;

  // if (event === AuditLogEntryType.TRANSACTION) {
  // tx audit log is saved via persistPayment");
  // }

  if (event === AuditLogEntryType.AUTH) {
    const { authResponse, lnurlDetails, origin } = data;

    eventDetails = { authResponse, lnurlDetails, origin };
  }

  if (event === AuditLogEntryType.INVOICE) {
    const { paymentRequest, rHash } = data;

    eventDetails = { paymentRequest, rHash };
  }

  if (event === AuditLogEntryType.BUDGET) {
    const { type, allowanceId } = data;

    eventDetails = { type, allowanceId };
  }

  const dbAuditLogEntry: DbAuditLogEntry = {
    createdAt: Date.now().toString(),
    event,
    details: JSON.stringify(eventDetails),
  };

  await db.auditLogEntries.add(dbAuditLogEntry);
  await db.saveToStorage();
};
