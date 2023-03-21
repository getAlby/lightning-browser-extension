import db from "~/extension/background-script/db";
import { permissionsFixture } from "~/fixtures/permissions";
import type { DbPermission, MessagePermissionsList, Permission } from "~/types";

import listByAllowance from "../list";

const mockNow = 1487076708000;
Date.now = jest.fn(() => mockNow);

const mockPermissions: DbPermission[] = permissionsFixture;

const resultPermissions: Permission[] = [
  {
    ...mockPermissions[0],
    id: 1,
  },
  {
    ...mockPermissions[1],
    id: 2,
  },
];

beforeEach(async () => {
  // fill the DB first
  await db.permissions.bulkAdd(mockPermissions);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("delete permissions by id", () => {
  test("bulk deletes permissions using keys", async () => {
    const message: MessagePermissionsList = {
      application: "LBE",
      prompt: true,
      action: "listPermissions",
      origin: {
        internal: true,
      },
      args: {
        id: 1,
        accountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
      },
    };

    expect(await listByAllowance(message)).toStrictEqual({
      data: {
        permissions: resultPermissions,
      },
    });
  });
});
