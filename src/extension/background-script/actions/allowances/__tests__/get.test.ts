import db from "~/extension/background-script/db";
import type { MessageAllowanceGet, DbAllowance, DbPayment } from "~/types";

import getAllowance from "../get";

const mockPayments: DbPayment[] = [
  {
    allowanceId: "3",
    createdAt: "123456",
    description: "A blue bird?!",
    destination: "Space",
    host: "pro.kollider.xyz",
    id: 4,
    location: "kollider",
    name: "Kollider",
    paymentHash: "123",
    paymentRequest: "123",
    preimage: "123",
    totalAmount: 1000,
    totalFees: 111,
  },
  {
    allowanceId: "3",
    createdAt: "123456",
    description: "A yellow bird?!",
    destination: "Space",
    host: "pro.kollider.xyz",
    id: 5,
    location: "kollider",
    name: "Kollider",
    paymentHash: "123",
    paymentRequest: "123",
    preimage: "123",
    totalAmount: "2000",
    totalFees: "222",
  },
];

const mockAllowances: DbAllowance[] = [
  {
    enabled: true,
    host: "pro.kollider.xyz",
    id: 1,
    imageURL: "https://pro.kollider.xyz/favicon.ico",
    lastPaymentAt: 0,
    lnurlAuth: true,
    name: "pro kollider",
    remainingBudget: 5000,
    totalBudget: 5000,
    createdAt: "123456",
    tag: "",
  },
  {
    enabled: true,
    host: "lnmarkets.com",
    id: 2,
    imageURL: "https://lnmarkets.com/apple-touch-icon.png",
    lastPaymentAt: 0,
    lnurlAuth: true,
    name: "LN Markets",
    remainingBudget: 200,
    totalBudget: 200,
    createdAt: "123456",
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

    await db.payments.bulkAdd(mockPayments);
    await db.allowances.bulkAdd(mockAllowances);

    expect(await getAllowance(message)).toStrictEqual({
      data: {
        ...mockAllowances[0],
        payments: mockPayments.reverse(),
        paymentsAmount: 3000,
        paymentsCount: 2,
        percentage: "0",
        usedBudget: 0,
      },
    });
  });
});
