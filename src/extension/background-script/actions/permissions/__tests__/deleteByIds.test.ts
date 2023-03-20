import db from "~/extension/background-script/db";
import { permissionsFixture } from "~/fixtures/permissions";
import type { DbPermission, MessagePermissionsDelete } from "~/types";

import deleteByIds from "../deleteByIds";

const mockNow = 1487076708000;
Date.now = jest.fn(() => mockNow);

const mockPermissions: DbPermission[] = permissionsFixture;

beforeEach(async () => {
  // fill the DB first
  await db.permissions.bulkAdd(mockPermissions);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("delete permissions by id", () => {
  test("bulk deletes permissions using keys", async () => {
    const message: MessagePermissionsDelete = {
      application: "LBE",
      prompt: true,
      action: "deletePermissions",
      origin: {
        internal: true,
      },
      args: {
        ids: [2, 3],
        accountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
      },
    };

    await deleteByIds(message);

    const dbPermissions = await db.permissions.toArray();

    expect(dbPermissions).toStrictEqual([mockPermissions[0]]);
  });
});
