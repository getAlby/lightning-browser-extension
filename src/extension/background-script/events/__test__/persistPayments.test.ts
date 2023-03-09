import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import { paymentsFixture } from "~/fixtures/payment";
import type {
  DbAllowance,
  DbPayment,
  MessagePaymentAll,
  PaymentNotificationData,
} from "~/types";

import getPayments from "../../actions/payments/all";
import { persistSuccessfulPayment } from "../persistPayments";

Date.now = jest.fn(() => 1487076708000);

const mockAllowances: DbAllowance[] = allowanceFixture;
const mockPayments: DbPayment[] = paymentsFixture;

const updatedPayments: DbPayment[] = [
  ...paymentsFixture,
  {
    allowanceId: "1",
    createdAt: "1487076708000",
    description: "A red bird?!",
    destination: "Space",
    host: "pro.kollider.xyz",
    id: 6,
    location: "test",
    name: "Kollider",
    paymentHash: "123",
    paymentRequest: "",
    preimage: "123",
    totalAmount: 2121,
    totalFees: 333,
  },
];

const data: PaymentNotificationData = {
  response: {
    data: {
      preimage: "123",
      paymentHash: "123",
      route: {
        total_amt: 2121,
        total_fees: 333,
      },
    },
  },
  details: {
    description: "A red bird?!",
    destination: "Space",
  },
  origin: {
    location: "test",
    domain: "",
    host: "pro.kollider.xyz",
    pathname: "test",
    name: "Kollider",
    description: "test",
    icon: "",
    metaData: {},
    external: true,
  },
};

describe("Persist payments", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("updates payments on persisting successful payment", async () => {
    const message: MessagePaymentAll = {
      application: "LBE",
      origin: { internal: true },
      prompt: true,
      action: "getPayments",
    };

    await db.allowances.bulkAdd(mockAllowances);
    await db.payments.bulkAdd(mockPayments);

    await persistSuccessfulPayment("ln.sendPayment.success", data);

    expect(await getPayments(message)).toEqual({
      data: {
        payments: [...updatedPayments.reverse()],
      },
    });
  });
});
