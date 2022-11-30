import db from "~/extension/background-script/db";
import { DbAllowanceMockData } from "~/fixtures/allowances";
import { DbPaymentsMockData } from "~/fixtures/payment";
import type { MessageAllowanceGetById, DbAllowance, DbPayment } from "~/types";

import getAllowanceById from "../getById";

const mockPayments: DbPayment[] = DbPaymentsMockData;

const mockAllowances: DbAllowance[] = DbAllowanceMockData;

describe("get allowance by id", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("get allowance by id", async () => {
    const message: MessageAllowanceGetById = {
      application: "LBE",
      prompt: true,
      action: "getAllowanceById",
      origin: {
        internal: true,
      },
      args: {
        id: 1,
      },
    };

    await db.payments.bulkAdd(mockPayments);
    await db.allowances.bulkAdd(mockAllowances);

    expect(await getAllowanceById(message)).toStrictEqual({
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
