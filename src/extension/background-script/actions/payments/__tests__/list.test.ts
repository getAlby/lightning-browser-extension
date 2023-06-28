import db from "~/extension/background-script/db";
import type { DbPayment, MessagePaymentList } from "~/types";

import list from "../list";

const mockPayments: DbPayment[] = [
  {
    accountId: "12345",
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
    accountId: "12345",
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
    totalFees: 222,
  },
];

describe("payment list", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("get payments list", async () => {
    const message: MessagePaymentList = {
      application: "LBE",
      origin: { internal: true },
      prompt: true,
      action: "getPayments",
    };

    await db.payments.bulkAdd(mockPayments);

    expect(await list(message)).toStrictEqual({
      data: {
        payments: [...mockPayments.reverse()],
      },
    });
  });
});
