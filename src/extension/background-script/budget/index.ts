import type { DbAllowance } from "~/types";

import db from "../db";

function isEnabledForWebln(allowance: DbAllowance) {
  return new Set(allowance.enabledFor).has("webln");
}

// Takes the amount out of the host's budget before the payment is sent and
// returns whether it was covered. Returns false when the host has no usable
// allowance or the budget does not cover the amount, in which case the caller
// has to ask the user instead.
//
// The amount is never put back, even when the payment fails: the failure mode
// is a budget that is too small until the user tops it up, rather than one that
// can be spent twice.
//
// Reading the budget and writing the new one has to happen in a single
// transaction: the payment afterwards is asynchronous, so several calls from
// the same origin would otherwise all read the same budget, all consider
// themselves covered by it, and each spend it.
export async function debitBudget(
  host: string,
  amount: number
): Promise<boolean> {
  if (!Number.isFinite(amount) || amount < 0) {
    return false;
  }

  const debited = await db.transaction("rw", db.allowances, async () => {
    const allowance = await db.allowances
      .where("host")
      .equalsIgnoreCase(host)
      .first();

    if (
      !allowance ||
      !allowance.id ||
      !allowance.enabled ||
      !isEnabledForWebln(allowance)
    ) {
      return false;
    }

    const remainingBudget = allowance.remainingBudget || 0;
    // keeps the pre-existing comparison: the budget has to be higher than the
    // amount, and the amount can be 0
    if (!(remainingBudget > amount)) {
      return false;
    }

    await db.allowances.update(allowance.id, {
      remainingBudget: remainingBudget - amount,
      lastPaymentAt: Date.now(),
    });

    return true;
  });

  if (debited) {
    // outside the transaction: the storage write must not run inside it, and
    // a storage failure must not turn a debited budget into a prompt
    try {
      await db.saveToStorage();
    } catch (e) {
      console.error("Failed to persist the allowance budget", e);
    }
  }

  return debited;
}
