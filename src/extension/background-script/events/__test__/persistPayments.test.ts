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
    accountId: "123456",
    allowanceId: "1",
    createdAt: "1487076708000",
    description: "A red bird?!",
    destination: "Space",
    host: "getalby.com",
    id: 6,
    location: "test",
    name: "Alby",
    paymentHash: "123",
    paymentRequest: "",
    preimage: "123",
    totalAmount: 2121,
    totalFees: 333,
  },
];

const updatedPaymentsWithoutOrigin: DbPayment[] = [
  ...updatedPayments,
  {
    accountId: "123456",
    allowanceId: "",
    createdAt: "1487076708000",
    description: "A blue bird?!",
    destination: "Space",
    host: "",
    id: 7,
    paymentHash: "321",
    paymentRequest: "",
    preimage: "321",
    totalAmount: 2121,
    totalFees: 333,
  },
];

const data: PaymentNotificationData = {
  accountId: "123456",
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
    host: "getalby.com",
    pathname: "test",
    name: "Alby",
    description: "test",
    icon: "",
    metaData: {},
    external: true,
  },
};

const dataWitouthOrigin: PaymentNotificationData = {
  accountId: "123456",
  response: {
    data: {
      preimage: "321",
      paymentHash: "321",
      route: {
        total_amt: 2121,
        total_fees: 333,
      },
    },
  },
  details: {
    description: "A blue bird?!",
    destination: "Space",
  },
};

db.allowances.bulkAdd(mockAllowances);
db.payments.bulkAdd(mockPayments);

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

    await persistSuccessfulPayment("ln.sendPayment.success", data);

    expect(await getPayments(message)).toEqual({
      data: {
        payments: [...updatedPayments.reverse()],
      },
    });
  });

  test("updates payments on persisting successful payment with empty origin (i.e. pay to ln-address inside popup)", async () => {
    const message: MessagePaymentAll = {
      application: "LBE",
      origin: { internal: true },
      prompt: true,
      action: "getPayments",
    };

    await persistSuccessfulPayment("ln.sendPayment.success", dataWitouthOrigin);

    expect(await getPayments(message)).toEqual({
      data: {
        payments: [...updatedPaymentsWithoutOrigin.reverse()],
      },
    });
  });
});
