import db from "~/extension/background-script/db";
import state from "~/extension/background-script/state";
import { allowanceFixture } from "~/fixtures/allowances";
import { permissionsFixture } from "~/fixtures/permissions";
import type { DbAllowance, MessagePermissionAdd } from "~/types";

import addPermission from "../add";

jest.mock("~/extension/background-script/state");

const defaultMockState = {
  currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
};

const mockState = defaultMockState;
state.getState = jest.fn().mockReturnValue(mockState);

Date.now = jest.fn(() => 1487076708000);

const mockAllowances: DbAllowance[] = [allowanceFixture[0]];

beforeEach(async () => {
  await db.permissions.clear();
  await db.allowances.clear();
  // fill the DB first
  await db.allowances.bulkAdd(mockAllowances);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("add permission", () => {
  test("saves enabled permissions", async () => {
    const message: MessagePermissionAdd = {
      application: "LBE",
      prompt: true,
      action: "addPermission",
      origin: {
        internal: true,
      },
      args: {
        host: mockAllowances[0].host,
        method: "the-request-method-1",
        enabled: true,
        blocked: false,
      },
    };

    await addPermission(message);

    const dbPermissions = await db.permissions.toArray();

    expect(dbPermissions).toStrictEqual([permissionsFixture[0]]);
  });

  test("saves disabled permissions", async () => {
    const message: MessagePermissionAdd = {
      application: "LBE",
      prompt: true,
      action: "addPermission",
      origin: {
        internal: true,
      },
      args: {
        host: mockAllowances[0].host,
        method: "the-request-method-2",
        enabled: true,
        blocked: true,
      },
    };

    await addPermission(message);

    const dbPermissions = await db.permissions.toArray();

    expect(dbPermissions).toStrictEqual([permissionsFixture[1]]);
  });
});
