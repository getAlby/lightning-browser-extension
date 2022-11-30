import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import type { DbAllowance, MessageAllowanceUpdate } from "~/types";

import updateAllowance from "../update";

const mockAllowances: DbAllowance[] = allowanceFixture;

db.allowances.bulkAdd(mockAllowances);

describe("update allowance", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("setting props via update", async () => {
    const message: MessageAllowanceUpdate = {
      application: "LBE",
      prompt: true,
      action: "updateAllowance",
      origin: {
        internal: true,
      },
      args: {
        id: 2,
        totalBudget: 1500,
        enabled: true,
        lnurlAuth: true,
      },
    };

    expect(await updateAllowance(message)).toStrictEqual({
      data: 1,
    });

    const allowance = await db.allowances.get(2);

    expect(allowance?.totalBudget).toEqual(1500);
    expect(allowance?.enabled).toEqual(true);
    expect(allowance?.lnurlAuth).toEqual(true);
  });

  test("set enable and lnurlAuth to false", async () => {
    const message: MessageAllowanceUpdate = {
      application: "LBE",
      prompt: true,
      action: "updateAllowance",
      origin: {
        internal: true,
      },
      args: {
        id: 1,
        enabled: false,
        lnurlAuth: false,
      },
    };

    expect(await updateAllowance(message)).toStrictEqual({
      data: 1,
    });

    const allowance = await db.allowances.get(1);
    expect(allowance?.enabled).toEqual(false);
    expect(allowance?.lnurlAuth).toEqual(false);
  });
});
