import type {
  MessageAllowanceAdd,
  DbAllowance,
  AuditLogEntryBudgetUpdateDetails,
} from "~/types";
import { AuditLogEntryType, AuditLogEntryBudgetType } from "~/types";

import db from "../../db";

const add = async (message: MessageAllowanceAdd) => {
  const host = message.args.host;
  const name = message.args.name;
  const imageURL = message.args.imageURL;
  const totalBudget = message.args.totalBudget;

  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (allowance) {
    if (!allowance.id) return { error: "id is missing" };

    const eventData: AuditLogEntryBudgetUpdateDetails = {
      type: AuditLogEntryBudgetType.UPDATE,
      allowanceId: allowance.id,
      event: AuditLogEntryType.BUDGET,
    };

    PubSub.publish("budget.success", eventData);

    db.allowances.update(allowance.id, {
      enabled: true,
      imageURL: imageURL,
      name: name,
      remainingBudget: totalBudget,
      totalBudget: totalBudget,
    });
  } else {
    // QUESTION: is it possible to reach this without having the site "enabled" before anyways (where an allowance is added already)?
    const dbAllowance: DbAllowance = {
      createdAt: Date.now().toString(),
      enabled: true,
      host: host,
      imageURL: imageURL,
      lastPaymentAt: 0,
      lnurlAuth: false,
      name: name,
      remainingBudget: totalBudget,
      tag: "",
      totalBudget: totalBudget,
    };

    // persist budget-event?

    await db.allowances.add(dbAllowance);
  }
  await db.saveToStorage();

  return { data: { allowance } };
};

export default add;
