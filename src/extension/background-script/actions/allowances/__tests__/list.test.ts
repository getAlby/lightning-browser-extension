import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import { paymentsFixture } from "~/fixtures/payment";
import type {
  Allowance,
  DbAllowance,
  DbPayment,
  MessageAllowanceList,
} from "~/types";

import listAllowances from "../list";

const mockPayments: DbPayment[] = paymentsFixture;

const mockAllowances: DbAllowance[] = allowanceFixture;

const resultAllowances: Allowance[] = [
  {
    ...mockAllowances[2],
    id: 3,
    payments: [],
    paymentsAmount: 0,
    paymentsCount: 0,
    percentage: "0",
    usedBudget: 0,
  },
  {
    ...mockAllowances[1],
    id: 2,
    payments: [],
    paymentsAmount: 0,
    paymentsCount: 0,
    percentage: "0",
    usedBudget: 0,
  },
  {
    ...mockAllowances[0],
    id: 1,
    payments: [],
    paymentsAmount: 3000,
    paymentsCount: 2,
    percentage: "0",
    usedBudget: 0,
  },
];

const resultAllowancesWithAccount: Allowance[] = [
  {
    ...mockAllowances[2],
    id: 3,
    payments: [],
    paymentsAmount: 0,
    paymentsCount: 0,
    percentage: "0",
    usedBudget: 0,
  },
];

describe("list allowances", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(async () => {
    await db.payments.bulkAdd(mockPayments);
    await db.allowances.bulkAdd(mockAllowances);
  });

  test("list allowances", async () => {
    const message: MessageAllowanceList = {
      application: "LBE",
      prompt: true,
      action: "listAllowances",
      origin: {
        internal: true,
      },
    };
    expect(await listAllowances(message)).toStrictEqual({
      data: {
        allowances: resultAllowances,
      },
    });
  });

  test("list allowances with accountid", async () => {
    const message: MessageAllowanceList = {
      application: "LBE",
      prompt: true,
      action: "listAllowances",
      args: {
        accountId: "xxxx-xxxx-xxxx-xxx1",
      },
      origin: {
        internal: true,
      },
    };
    expect(await listAllowances(message)).toStrictEqual({
      data: {
        allowances: resultAllowancesWithAccount,
      },
    });
  });
});
