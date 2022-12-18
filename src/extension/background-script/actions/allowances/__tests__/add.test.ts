import db from "~/extension/background-script/db";
import state from "~/extension/background-script/state";
import { allowanceFixture } from "~/fixtures/allowances";
import { backgroundState } from "~/fixtures/state";
import type { DbAllowance, MessageAllowanceAdd } from "~/types";

import addAllowance from "../add";

Date.now = jest.fn(() => 1487076708000);

const mockAllowances: DbAllowance[] = [{ ...allowanceFixture[0] }];

const defaultMockState = Object.assign(backgroundState, {
  saveToStorage: jest.fn,
  isUnlocked: jest.fn(() => true),
});

const mockState = defaultMockState;
state.getState = jest.fn().mockReturnValue(mockState);

describe("add allowance", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("add allowance without accountId", async () => {
    const message: MessageAllowanceAdd = {
      application: "LBE",
      prompt: true,
      action: "addAllowance",
      origin: {
        internal: true,
      },
      args: {
        host: "lnmarkets.com",
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
      host: "lnmarkets.com",
      imageURL: "https://lnmarkets.com/apple-touch-icon.png",
      lastPaymentAt: 0,
      lnurlAuth: false,
      name: "LN Markets",
      remainingBudget: 200,
      tag: "",
      totalBudget: 200,
      id: 2,
      accountId: "xxxx-xxxx-xxxx-xxxx-xxx1",
    });
  });
});
