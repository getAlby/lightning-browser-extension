import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import { permissionsFixture } from "~/fixtures/permissions";
import type { DbAllowance, MessagePermissionAdd } from "~/types";

import addPermission from "../add";

Date.now = jest.fn(() => 1487076708000);

const mockAllowances: DbAllowance[] = [allowanceFixture[0]];

beforeEach(async () => {
  // fill the DB first
  await db.allowances.bulkAdd(mockAllowances);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("add permission", () => {
  test("saves permissions", async () => {
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
});
