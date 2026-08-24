import db from "~/extension/background-script/db";
import type { DbAllowance } from "~/types";

import { refundBudget, reserveBudget } from "..";

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

describe("reserveBudget", () => {
  test("takes the amount out of the budget straight away", async () => {
    const reservation = await reserveBudget(HOST, 60);

    expect(reservation).toEqual({ allowanceId: 1, amount: 60 });
    expect(await remaining()).toBe(40);
  });

  test("concurrent reservations cannot exceed the budget", async () => {
    const results = await Promise.all(
      [60, 60, 60, 60, 60].map(() => reserveBudget(HOST, 60))
    );

    const granted = results.filter(Boolean);
    expect(granted).toHaveLength(1);
    expect(await remaining()).toBe(40);
  });

  test("hands out every reservation the budget does cover", async () => {
    const results = await Promise.all(
      [30, 30, 30, 30].map(() => reserveBudget(HOST, 30))
    );

    expect(results.filter(Boolean)).toHaveLength(3); // 3 x 30 < 100, the 4th does not fit
    expect(await remaining()).toBe(10);
  });

  test("refuses a budget that only equals the amount", async () => {
    expect(await reserveBudget(HOST, 100)).toBeNull();
    expect(await remaining()).toBe(100);
  });

  test("refuses a disabled allowance", async () => {
    await db.allowances.update(1, { enabled: false });

    expect(await reserveBudget(HOST, 10)).toBeNull();
    expect(await remaining()).toBe(100);
  });

  test("refuses an allowance that is not enabled for webln", async () => {
    await db.allowances.update(1, { enabledFor: ["nostr"] });

    expect(await reserveBudget(HOST, 10)).toBeNull();
    expect(await remaining()).toBe(100);
  });

  test("refuses a host without an allowance", async () => {
    expect(await reserveBudget("example.com", 10)).toBeNull();
  });

  test("refuses a negative or non-finite amount", async () => {
    expect(await reserveBudget(HOST, -1)).toBeNull();
    expect(await reserveBudget(HOST, NaN)).toBeNull();
    expect(await remaining()).toBe(100);
  });
});

describe("refundBudget", () => {
  test("puts a reservation back", async () => {
    const reservation = await reserveBudget(HOST, 60);
    await refundBudget(reservation!);

    expect(await remaining()).toBe(100);
  });

  test("never refunds above the total budget", async () => {
    await refundBudget({ allowanceId: 1, amount: 5000 });

    expect(await remaining()).toBe(100);
  });

  test("ignores an allowance that no longer exists", async () => {
    await db.allowances.clear();

    await expect(
      refundBudget({ allowanceId: 1, amount: 10 })
    ).resolves.toBeUndefined();
  });
});
