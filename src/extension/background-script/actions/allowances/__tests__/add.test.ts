import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import type { DbAllowance, MessageAllowanceAdd } from "~/types";

import addAllowance from "../add";

Date.now = jest.fn(() => 1487076708000);

const mockAllowances: DbAllowance[] = [{ ...allowanceFixture[0] }];

describe("add allowance", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("add allowance", async () => {
    const message: MessageAllowanceAdd = {
      application: "LBE",
      prompt: true,
      action: "addAllowance",
      origin: {
        internal: true,
      },
      args: {
        host: "https://lnmarkets.com",
        name: "LN Markets",
        imageURL: "https://lnmarkets.com/apple-touch-icon.png",
        totalBudget: 200,
      },
    };

    await db.allowances.bulkAdd(mockAllowances);

    await addAllowance(message);

    const dbAllowances = await db.allowances
      .toCollection()
      .reverse()
      .sortBy("lastPaymentAt");

    expect(dbAllowances).toContainEqual({
      createdAt: "1487076708000",
      enabled: true,
      host: "https://lnmarkets.com",
      imageURL: "https://lnmarkets.com/apple-touch-icon.png",
      lastPaymentAt: 0,
      lnurlAuth: false,
      name: "LN Markets",
      remainingBudget: 200,
      tag: "",
      totalBudget: 200,
      id: 2,
    });
  });
});
