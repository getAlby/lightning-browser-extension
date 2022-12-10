import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import { paymentsFixture } from "~/fixtures/payment";
import type { DbAllowance, MessageAllowanceDelete, DbPayment } from "~/types";

import deleteAllowance from "../delete";

const mockAllowances: DbAllowance[] = allowanceFixture;
const mockPayments: DbPayment[] = paymentsFixture;

const mockPermissions = [
  {
    id: 1,
    allowanceId: 1,
    createdAt: "1667291216372",
    host: "pro.kollider.xyz",
    method: "webln/listchannels",
    blocked: false,
    enabled: true,
  },
  {
    id: 2,
    allowanceId: 2,
    createdAt: "1667291216372",
    host: "lnmarkets.com",
    method: "webln/getinfo",
    blocked: false,
    enabled: true,
  },
  {
    id: 3,
    allowanceId: 2,
    createdAt: "1667291216372",
    host: "lnmarkets.com",
    method: "webln/signmessage",
    blocked: false,
    enabled: true,
  },
];

beforeEach(async () => {
  await db.allowances.bulkAdd(mockAllowances);
  await db.permissions.bulkAdd(mockPermissions);
  await db.payments.bulkAdd(mockPayments);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("delete allowance", () => {
  test("deletes allowance and the corresponding permissions", async () => {
    const message: MessageAllowanceDelete = {
      application: "LBE",
      prompt: true,
      action: "deleteAllowance",
      origin: {
        internal: true,
      },
      args: {
        id: 2,
      },
    };
    let paymentsCount;

    const dbAllowance = await db.allowances.get({ id: 2 });
    if (dbAllowance) {
      paymentsCount = await db.payments
        .where("host")
        .equalsIgnoreCase(dbAllowance.host)
        .count();

      expect(paymentsCount).toEqual(1);
    }

    expect(await deleteAllowance(message)).toStrictEqual({
      data: true,
    });

    const dbAllowances = await db.allowances
      .toCollection()
      .reverse()
      .sortBy("lastPaymentAt");

    if (dbAllowance) {
      paymentsCount = await db.payments
        .where("host")
        .equalsIgnoreCase(dbAllowance.host)
        .count();

      expect(paymentsCount).toEqual(0);
    }

    expect(dbAllowances).toEqual([
      {
        enabled: true,
        host: "pro.kollider.xyz",
        id: 1,
        imageURL: "https://pro.kollider.xyz/favicon.ico",
        lastPaymentAt: 0,
        lnurlAuth: true,
        name: "pro kollider",
        remainingBudget: 500,
        totalBudget: 500,
        createdAt: "123456",
        tag: "",
      },
    ]);

    const dbPermissions = await db.permissions.toArray();
    expect(dbPermissions).toEqual([mockPermissions[0]]);
  });
});
