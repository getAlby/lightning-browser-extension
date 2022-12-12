import db from "~/extension/background-script/db";
import { permissionsFixture } from "~/fixtures/permissions";
import type { DbPermission, MessagePermissionDelete } from "~/types";

import deletePermission from "../delete";

const mockNow = 1487076708000;
Date.now = jest.fn(() => mockNow);

const mockPermissions: DbPermission[] = permissionsFixture;

const resultPermissions: DbPermission[] = permissionsFixture.filter(
  (permission) => permission.id !== 2
);

beforeEach(async () => {
  // fill the DB first
  await db.permissions.bulkAdd(mockPermissions);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("delete permission", () => {
  test("removes permission method from allowance and deletes permission", async () => {
    const message: MessagePermissionDelete = {
      application: "LBE",
      prompt: true,
      action: "deletePermission",
      origin: {
        internal: true,
      },
      args: {
        host: mockPermissions[1].host,
        method: "the-request-method-2",
      },
    };

    await deletePermission(message);

    const dbPermissions = await db.permissions.toArray();

    expect(dbPermissions).toStrictEqual(resultPermissions);
  });
});
