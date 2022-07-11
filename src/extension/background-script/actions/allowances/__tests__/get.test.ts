import db from "~/extension/background-script/db";
import type { MessageAllowanceGet } from "~/types";

import getAllowance from "../get";

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
    enabled: true,
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

  test("get allowance", async () => {
    const message: MessageAllowanceGet = {
      application: "LBE",
      prompt: true,
      action: "getAllowance",
      origin: {
        internal: true,
      },
      args: {
        host: "pro.kollider.xyz",
      },
    };

    await db.allowances.bulkAdd(mockAllowances);

    expect(await getAllowance(message)).toStrictEqual({
      data: mockAllowances[0],
    });
  });
});
