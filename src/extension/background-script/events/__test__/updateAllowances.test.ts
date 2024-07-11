import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
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
});
