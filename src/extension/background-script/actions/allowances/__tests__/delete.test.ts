import db from "~/extension/background-script/db";
import type { MessageAllowanceDelete } from "~/types";

import deleteAllowance from "../delete";

const mockAllowances = [
  {
    enabled: true,
    host: "pro.kollider.xyz",
    id: 1,
    imageURL: "https://pro.kollider.xyz/favicon.ico",
    lastPaymentAt: "0",
    lnurlAuth: "true",
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
  {
    enabled: false,
    host: "lnmarkets.com",
    id: 2,
    imageURL: "https://lnmarkets.com/apple-touch-icon.png",
    lastPaymentAt: "0",
    lnurlAuth: "true",
    name: "LN Markets",
    remainingBudget: 200,
    totalBudget: 200,
    createdAt: "123456",
    payments: [],
    paymentsAmount: 0,
    paymentsCount: 0,
    percentage: "0",
    usedBudget: 0,
    tag: "",
  },
];

describe("account all", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("update allowance", async () => {
    const message: MessageAllowanceDelete = {
      application: "LBE",
      prompt: true,
      action: "deleteAllowance",
      origin: {
        internal: true,
      },
      args: {
        id: 2,
      },
    };

    await db.allowances.bulkAdd(mockAllowances);

    expect(await deleteAllowance(message)).toStrictEqual({
      data: true,
    });

    const dbAllowances = await db.allowances
      .toCollection()
      .reverse()
      .sortBy("lastPaymentAt");

    expect(dbAllowances).toEqual([
      {
        enabled: true,
        host: "pro.kollider.xyz",
        id: 1,
        imageURL: "https://pro.kollider.xyz/favicon.ico",
        lastPaymentAt: "0",
        lnurlAuth: "true",
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
    ]);
  });
});
