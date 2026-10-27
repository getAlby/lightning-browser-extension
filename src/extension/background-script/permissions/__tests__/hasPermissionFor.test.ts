import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import { permissionsFixture } from "~/fixtures/permissions";

import { hasPermissionFor } from "../hasPermissionFor";

jest.mock("~/extension/background-script/state", () => ({
  getState: () => ({
    currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
  }),
}));

// both are enabled, but the second one is a remembered denial
const allowedPermission = permissionsFixture[0];
const blockedPermission = permissionsFixture[1];

beforeEach(async () => {
  await db.allowances.bulkAdd(allowanceFixture);
  await db.permissions.bulkAdd(permissionsFixture);
});

afterEach(async () => {
  await db.allowances.clear();
  await db.permissions.clear();
});

describe("hasPermissionFor", () => {
  test("is true for an enabled permission", async () => {
    expect(
      await hasPermissionFor(allowedPermission.method, allowedPermission.host)
    ).toBe(true);
  });

  test("is false for a blocked permission", async () => {
    expect(
      await hasPermissionFor(blockedPermission.method, blockedPermission.host)
    ).toBe(false);
  });

  test("is false when no permission is stored", async () => {
    expect(
      await hasPermissionFor("some-other-method", allowedPermission.host)
    ).toBe(false);
  });
});
