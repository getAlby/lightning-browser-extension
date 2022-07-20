import db from "~/extension/background-script/db";
import type { MessageAllowanceUpdate } from "~/types";

import updateAllowance from "../update";

const mockAllowances = [
  {
    enabled: true,
    host: "pro.kollider.xyz",
    id: 1,
    imageURL: "https://pro.kollider.xyz/favicon.ico",
    lastPaymentAt: "0",
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
  {
    enabled: false,
    host: "lnmarkets.com",
    id: 2,
    imageURL: "https://lnmarkets.com/apple-touch-icon.png",
    lastPaymentAt: "0",
    lnurlAuth: true,
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
    const message: MessageAllowanceUpdate = {
      application: "LBE",
      prompt: true,
      action: "updateAllowance",
      origin: {
        internal: true,
      },
      args: {
        id: 2,
        totalBudget: 1500,
        enabled: true,
      },
    };

    await db.allowances.bulkAdd(mockAllowances);

    expect(await updateAllowance(message)).toStrictEqual({
      data: 1,
    });

    const allowance = await db.allowances.get(2);

    expect(allowance?.totalBudget).toEqual(1500);
    expect(allowance?.enabled).toEqual(true);
  });
});
