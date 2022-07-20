import db from "~/extension/background-script/db";
import type { Allowance, Payment, MessageAllowanceList } from "~/types";

import listAllowances from "../list";

const mockPayments: Payment[] = [
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
    description: "A yllow bird?!",
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

const mockAllowances: Allowance[] = [
  {
    enabled: true,
    host: "pro.kollider.xyz",
    id: 3,
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
    enabled: true,
    host: "lnmarkets.com",
    id: 4,
    imageURL: "https://lnmarkets.com/apple-touch-icon.png",
    lastPaymentAt: "0",
    lnurlAuth: false,
    name: "LN Markets",
    remainingBudget: 200,
    totalBudget: 200,
    createdAt: "1487076708000",
    payments: [],
    paymentsAmount: 0,
    paymentsCount: 0,
    percentage: "0",
    usedBudget: 0,
    tag: "",
  },
];

const resultAllowances: Allowance[] = [
  mockAllowances[1],
  {
    ...mockAllowances[0],
    paymentsAmount: 3000,
    paymentsCount: 2,
  },
];

describe("account all", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("get all accounts", async () => {
    const message: MessageAllowanceList = {
      application: "LBE",
      prompt: true,
      action: "listAllowances",
      origin: {
        internal: true,
      },
    };

    await db.payments.bulkAdd(mockPayments);
    await db.allowances.bulkAdd(mockAllowances);

    expect(await listAllowances(message)).toStrictEqual({
      data: {
        allowances: resultAllowances,
      },
    });
  });
});
