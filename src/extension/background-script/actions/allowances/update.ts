import db from "~/extension/background-script/db";
import type { Allowance, MessageAllowanceUpdate } from "~/types";

type OptionalPick<T, K extends keyof T> = { [P in K]?: T[P] };

const updateAllowance = async (message: MessageAllowanceUpdate) => {
  const id = message.args.id;
  if (!id) return { error: "id is missing" };

  const update: OptionalPick<
    Allowance,
    "totalBudget" | "remainingBudget" | "enabled" | "lnurlAuth"
  > = {};

  if (Object.prototype.hasOwnProperty.call(message.args, "totalBudget")) {
    update.totalBudget = message.args.totalBudget;
    update.remainingBudget = message.args.totalBudget;
  }

  if (Object.prototype.hasOwnProperty.call(message.args, "enabled")) {
    update.enabled = message.args.enabled;
  }

  if (Object.prototype.hasOwnProperty.call(message.args, "lnurlAuth")) {
    update.lnurlAuth = message.args.lnurlAuth;
  }

  const updated = await db.allowances.update(id, update);
  await db.saveToStorage();
  return { data: updated };
};

export default updateAllowance;
