import db from "~/extension/background-script/db";
import type { DbPermission } from "~/types";

import migrate from "../index";

// Every migration except the one under test is marked as already applied,
// so `migrate()` runs only removeSignSchnorrPermissions.
const stateSaveToStorage = jest.fn(() => Promise.resolve());
jest.mock("~/extension/background-script/state", () => ({
  getState: () => ({
    migrations: [
      "migrateEncryptPermission",
      "migrateDecryptPermission",
      "migrateRemoveWeblnRequestPermissions",
    ],
    saveToStorage: stateSaveToStorage,
  }),
  setState: jest.fn(),
}));

const permissions: DbPermission[] = [
  {
    id: 1,
    accountId: "123456",
    allowanceId: 1,
    createdAt: "1667291216372",
    host: "nostr.example",
    method: "nostr/signSchnorr",
    blocked: false,
    enabled: true,
  },
  {
    id: 2,
    accountId: "123456",
    allowanceId: 1,
    createdAt: "1667291216372",
    host: "nostr.example",
    method: "nostr/signMessage",
    blocked: false,
    enabled: true,
  },
];

const methodsIn = (rows: DbPermission[]) => rows.map((p) => p.method).sort();

beforeEach(async () => {
  await db.permissions.clear();
  await db.permissions.bulkAdd(permissions);
  // Every code path that writes permissions mirrors IndexedDB into
  // browser.storage.local, so before the migration both stores agree.
  await db.saveToStorage();
});

describe("removeSignSchnorrPermissions", () => {
  test("removes the permission from IndexedDB", async () => {
    await migrate();

    expect(methodsIn(await db.permissions.toArray())).toEqual([
      "nostr/signMessage",
    ]);
  });

  test("removes the permission from the browser.storage.local mirror", async () => {
    await migrate();

    const mirror = await browser.storage.local.get("permissions");
    expect(methodsIn(mirror.permissions)).toEqual(["nostr/signMessage"]);
  });

  test("does not come back when IndexedDB is re-seeded from the mirror", async () => {
    await migrate();

    // Simulate the browser evicting IndexedDB (the reason loadFromStorage
    // exists): the table is empty on next startup, so the mirror is loaded.
    await db.permissions.clear();
    await db.loadFromStorage(db);

    expect(methodsIn(await db.permissions.toArray())).toEqual([
      "nostr/signMessage",
    ]);
  });
});
