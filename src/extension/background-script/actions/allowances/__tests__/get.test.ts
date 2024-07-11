import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import { paymentsFixture } from "~/fixtures/payment";
import type { DbAllowance, DbPayment, MessageAllowanceGet } from "~/types";

import getAllowance from "../get";

const mockPayments: DbPayment[] = paymentsFixture;

const mockAllowances: DbAllowance[] = allowanceFixture;

describe("get allowance", () => {
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
        host: "getalby.com",
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
        percentage: 0,
        usedBudget: 0,
      },
    });
  });
});
