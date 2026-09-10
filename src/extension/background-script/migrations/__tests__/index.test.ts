import browser from "webextension-polyfill";
import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import type { DbPermission } from "~/types";

import migrate, { type Migration } from "../index";

// Marks every migration as applied except the ones a test wants to run.
const allMigrations: Migration[] = [
  "migrateEncryptPermission",
  "migrateDecryptPermission",
  "removeSignSchnorrPermissions",
  "migrateRemoveWeblnRequestPermissions",
];
let pending: Migration[] = [];

jest.mock("~/extension/background-script/state", () => ({
  getState: () => ({
    migrations: allMigrations.filter((name) => !pending.includes(name)),
    saveToStorage: jest.fn(() => Promise.resolve()),
  }),
  setState: jest.fn(),
}));

const permission = (id: number, method: string): DbPermission => ({
  id,
  accountId: "123456",
  allowanceId: 1,
  createdAt: "1667291216372",
  host: "nostr.example",
  method,
  blocked: false,
  enabled: true,
});

const methodsIn = (rows: DbPermission[]) => rows.map((p) => p.method).sort();

const seed = async (rows: DbPermission[]) => {
  await db.allowances.clear();
  await db.allowances.bulkAdd(allowanceFixture);
  await db.permissions.clear();
  await db.permissions.bulkAdd(rows);
  // Every code path that writes permissions mirrors IndexedDB into
  // browser.storage.local, so before a migration both stores agree.
  await db.saveToStorage();
};

const mirroredMethods = async () => {
  const mirror = await browser.storage.local.get("permissions");
  return methodsIn(mirror.permissions);
};

describe("removeSignSchnorrPermissions", () => {
  beforeEach(async () => {
    pending = ["removeSignSchnorrPermissions"];
    await seed([
      permission(1, "nostr/signSchnorr"),
      permission(2, "nostr/signMessage"),
    ]);
  });

  test("removes the permission from IndexedDB", async () => {
    await migrate();

    expect(methodsIn(await db.permissions.toArray())).toEqual([
      "nostr/signMessage",
    ]);
  });

  test("removes the permission from the browser.storage.local mirror", async () => {
    await migrate();

    expect(await mirroredMethods()).toEqual(["nostr/signMessage"]);
  });

  test("does not come back when IndexedDB is re-seeded from the mirror", async () => {
    await migrate();

    // Simulate the browser dropping IndexedDB (the reason loadFromStorage
    // exists): the table is empty on next startup, so the mirror is loaded.
    await db.permissions.clear();
    await db.loadFromStorage(db);

    expect(methodsIn(await db.permissions.toArray())).toEqual([
      "nostr/signMessage",
    ]);
  });
});

describe("migrateDecryptPermission", () => {
  beforeEach(async () => {
    pending = ["migrateDecryptPermission"];
    await seed([
      permission(1, "nostr/nip04decrypt"),
      permission(2, "nostr/nip44decrypt"),
    ]);
  });

  test("mirrors the merged permission to browser.storage.local", async () => {
    await migrate();

    expect(methodsIn(await db.permissions.toArray())).toEqual([
      "nostr/decrypt",
    ]);
    expect(await mirroredMethods()).toEqual(["nostr/decrypt"]);
  });
});
