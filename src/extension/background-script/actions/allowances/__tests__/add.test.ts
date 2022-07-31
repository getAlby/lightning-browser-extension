import db from "~/extension/background-script/db";
import type { MessageAllowanceAdd } from "~/types";

import addAllowance from "../add";

Date.now = jest.fn(() => 1487076708000);

const mockAllowances = [
  {
    enabled: true,
    host: "pro.kollider.xyz",
    id: 3,
    imageURL: "https://pro.kollider.xyz/favicon.ico",
    lastPaymentAt: 0,
    lnurlAuth: true,
    name: "pro kollider",
    remainingBudget: 500,
    totalBudget: 500,
    createdAt: "123456",
    payments: [],
    paymentsAmount: 0,
    paymentsCount: 0,
    percentage: "0",
    usedBudget: 0,
    tag: "",
  },
];

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
      id: 4,
    });
  });
});
