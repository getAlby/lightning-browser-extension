import db from "~/extension/background-script/db";
import type { DbAllowance } from "~/types";

import { debitBudget } from "..";

const HOST = "getalby.com";

const allowance: DbAllowance = {
  createdAt: "123456",
  enabled: true,
  enabledFor: ["webln"],
  host: HOST,
  id: 1,
  imageURL: "",
  lastPaymentAt: 0,
  lnurlAuth: false,
  name: "test",
  remainingBudget: 100,
  tag: "",
  totalBudget: 100,
};

const remaining = async () => (await db.allowances.get(1))?.remainingBudget;

beforeEach(async () => {
  await db.allowances.clear();
  await db.allowances.add({ ...allowance });
});

describe("debitBudget", () => {
  test("takes the amount out of the budget straight away", async () => {
    expect(await debitBudget(HOST, 60)).toBe(true);
    expect(await remaining()).toBe(40);
  });

  test("concurrent debits cannot exceed the budget", async () => {
    const results = await Promise.all(
      [60, 60, 60, 60, 60].map(() => debitBudget(HOST, 60))
    );

    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await remaining()).toBe(40);
  });

  test("covers every debit the budget does cover", async () => {
    const results = await Promise.all(
      [30, 30, 30, 30].map(() => debitBudget(HOST, 30))
    );

    expect(results.filter(Boolean)).toHaveLength(3); // 3 x 30 < 100, the 4th does not fit
    expect(await remaining()).toBe(10);
  });

  test("refuses a budget that only equals the amount", async () => {
    expect(await debitBudget(HOST, 100)).toBe(false);
    expect(await remaining()).toBe(100);
  });

  test("refuses a disabled allowance", async () => {
    await db.allowances.update(1, { enabled: false });

    expect(await debitBudget(HOST, 10)).toBe(false);
    expect(await remaining()).toBe(100);
  });

  test("refuses an allowance that is not enabled for webln", async () => {
    await db.allowances.update(1, { enabledFor: ["nostr"] });

    expect(await debitBudget(HOST, 10)).toBe(false);
    expect(await remaining()).toBe(100);
  });

  test("refuses a host without an allowance", async () => {
    expect(await debitBudget("example.com", 10)).toBe(false);
  });

  test("refuses a negative or non-finite amount", async () => {
    expect(await debitBudget(HOST, -1)).toBe(false);
    expect(await debitBudget(HOST, NaN)).toBe(false);
    expect(await remaining()).toBe(100);
  });
});
