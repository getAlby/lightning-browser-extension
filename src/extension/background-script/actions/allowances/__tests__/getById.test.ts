import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import { paymentsFixture } from "~/fixtures/payment";
import type { DbAllowance, DbPayment, MessageAllowanceGetById } from "~/types";

import getAllowanceById from "../getById";

const mockPayments: DbPayment[] = paymentsFixture;

const mockAllowances: DbAllowance[] = allowanceFixture;

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
        percentage: 0,
        usedBudget: 0,
      },
    });
  });
});
