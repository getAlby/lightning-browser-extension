import db from "~/extension/background-script/db";
import type { DbAllowance, MessageAllowanceDelete } from "~/types";

import deleteAllowance from "../delete";

const mockAllowances: DbAllowance[] = [
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
  {
    enabled: false,
    host: "lnmarkets.com",
    id: 2,
    imageURL: "https://lnmarkets.com/apple-touch-icon.png",
    lastPaymentAt: 0,
    lnurlAuth: true,
    name: "LN Markets",
    remainingBudget: 200,
    totalBudget: 200,
    createdAt: "123456",
    tag: "",
  },
];

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

    expect(await deleteAllowance(message)).toStrictEqual({
      data: true,
    });

    const dbAllowances = await db.allowances
      .toCollection()
      .reverse()
      .sortBy("lastPaymentAt");

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
