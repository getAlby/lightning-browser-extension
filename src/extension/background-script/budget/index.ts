import type { DbAllowance } from "~/types";

import db from "../db";

export type BudgetReservation = {
  allowanceId: number;
  amount: number;
};

function isEnabledForWebln(allowance: DbAllowance) {
  return new Set(allowance.enabledFor).has("webln");
}

// Takes the amount out of the host's budget up front, in one transaction, and
// returns a handle describing what was taken. Returns null when the host has no
// usable allowance or the budget does not cover the amount, in which case the
// caller has to ask the user instead.
//
// Reading the budget and writing the new one has to happen in a single
// transaction: the payment in between is asynchronous, so several calls from the
// same origin would otherwise all read the same budget, all consider themselves
// covered by it, and each spend it.
export async function reserveBudget(
  host: string,
  amount: number
): Promise<BudgetReservation | null> {
  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return db.transaction("rw", db.allowances, async () => {
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
      return null;
    }

    const remainingBudget = allowance.remainingBudget || 0;
    // keeps the pre-existing comparison: the budget has to be higher than the
    // amount, and the amount can be 0
    if (!(remainingBudget > amount)) {
      return null;
    }

    await db.allowances.update(allowance.id, {
      remainingBudget: remainingBudget - amount,
      lastPaymentAt: Date.now(),
    });

    return { allowanceId: allowance.id, amount };
  });
}

// Puts a reservation back after a payment did not happen. Never raises the
// budget above the total the user set, so repeated refunds cannot inflate it.
export async function refundBudget({
  allowanceId,
  amount,
}: BudgetReservation): Promise<void> {
  await db.transaction("rw", db.allowances, async () => {
    const allowance = await db.allowances.get(allowanceId);
    if (!allowance) {
      return;
    }

    await db.allowances.update(allowanceId, {
      remainingBudget: Math.min(
        (allowance.remainingBudget || 0) + amount,
        allowance.totalBudget
      ),
    });
  });
}

// Persists the budget change. Kept separate from the transactions above so the
// storage write never runs inside a Dexie transaction.
export async function persistBudget(): Promise<void> {
  await db.saveToStorage();
}
