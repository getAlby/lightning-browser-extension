import lightningPayReq from "bolt11-signet";
import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import { createPaymentRequest } from "~/fixtures/paymentRequests";
import type {
  DbAllowance,
  MessageAllowanceGet,
  PaymentNotificationData,
} from "~/types";

import getAllowance from "../../actions/allowances/get";
import { updateAllowance } from "../allowances";

Date.now = jest.fn(() => 1487076708000);

const mockAllowances: DbAllowance[] = allowanceFixture;

const data: PaymentNotificationData = {
  accountId: "123456",
  response: {
    data: {
      preimage: "123",
      paymentHash: "123",
      route: {
        total_amt: 50,
        total_fees: 2,
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

describe("Update Allowances", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Updates allowances after successful payment", async () => {
    const message: MessageAllowanceGet = {
      application: "LBE",
      prompt: true,
      action: "getAllowance",
      origin: {
        internal: true,
      },
      args: {
        host: "getalby.com",
      },
    };

    await db.allowances.bulkAdd(mockAllowances);

    await updateAllowance("ln.sendPayment.success", data);

    expect(await getAllowance(message)).toEqual({
      data: {
        ...mockAllowances[0],
        payments: [],
        lastPaymentAt: 1487076708000,
        paymentsAmount: 0,
        paymentsCount: 0,
        percentage: 10,
        remainingBudget: 450,
        usedBudget: 50,
      },
    });
  });

  // a connector may floor the paid amount to 0 sats for a sub-satoshi invoice,
  // which left the budget untouched no matter how often the site paid. The debit
  // must use the same rounded-up amount the allowance check was made against.
  test("debits the invoice amount rather than what the connector reports", async () => {
    await updateAllowance("ln.sendPayment.success", {
      ...data,
      paymentRequestDetails: lightningPayReq.decode(createPaymentRequest(999)),
      response: {
        data: {
          preimage: "123",
          paymentHash: "123",
          route: { total_amt: 0, total_fees: 0 },
        },
      },
    });

    const allowance = await db.allowances.get(1);
    expect(allowance?.remainingBudget).toBe(449);
  });
});
