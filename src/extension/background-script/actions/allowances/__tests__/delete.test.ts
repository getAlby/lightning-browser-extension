import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import type { DbAllowance, MessageAllowanceDelete } from "~/types";

import deleteAllowance from "../delete";

const mockAllowances: DbAllowance[] = allowanceFixture;

const mockPermissions = [
  {
    id: 1,
    accountId: "123456",
    allowanceId: 1,
    createdAt: "1667291216372",
    host: "getalby.com",
    method: "webln/listchannels",
    blocked: false,
    enabled: true,
  },
  {
    id: 2,
    accountId: "123456",
    allowanceId: 2,
    createdAt: "1667291216372",
    host: "lnmarkets.com",
    method: "webln/getinfo",
    blocked: false,
    enabled: true,
  },
  {
    id: 3,
    accountId: "123456",
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
        host: "getalby.com",
        id: 1,
        imageURL: "https://getalby.com/favicon.ico",
        lastPaymentAt: 0,
        enabledFor: ["webln"],
        lnurlAuth: true,
        name: "Alby: Your Bitcoin & Nostr companion for the web",
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
