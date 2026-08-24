import { WITHDRAWN_PRESET_PERMISSIONS } from "~/common/utils/nostrPresets";
import db from "~/extension/background-script/db";
import { PermissionMethodNostr } from "~/types";

console.info = jest.fn();

const setStateMock = jest.fn();
// which migrations have already run for this test's profile
let alreadyMigrated: string[] = [];
jest.mock("~/extension/background-script/state", () => ({
  getState: () => ({
    migrations: alreadyMigrated,
    saveToStorage: jest.fn(async () => true),
  }),
  setState: (s: unknown) => setStateMock(s),
}));

import migrate from "../index";

const permission = (method: string, blocked = false) => ({
  createdAt: "0",
  accountId: "account-1",
  allowanceId: 1,
  host: "example.com",
  method,
  enabled: true,
  blocked,
});

beforeEach(async () => {
  await db.permissions.clear();
  setStateMock.mockClear();
  alreadyMigrated = ["migrateEncryptPermission", "migrateDecryptPermission"];
});

describe("revokeWithdrawnNostrPresetPermissions", () => {
  test("removes the permissions the reasonable preset no longer grants", async () => {
    await db.permissions.bulkAdd(
      WITHDRAWN_PRESET_PERMISSIONS.map((method) => permission(method))
    );

    await migrate();

    expect(await db.permissions.toArray()).toEqual([]);
  });

  test("keeps the permissions the preset still grants", async () => {
    const kept = `${PermissionMethodNostr.NOSTR_SIGNMESSAGE}/1`;
    await db.permissions.bulkAdd([
      permission(kept),
      permission(PermissionMethodNostr.NOSTR_GETPUBLICKEY),
      permission(PermissionMethodNostr.NOSTR_DECRYPT),
    ]);

    await migrate();

    const methods = (await db.permissions.toArray()).map((p) => p.method);
    expect(methods).toContain(kept);
    expect(methods).toContain(PermissionMethodNostr.NOSTR_GETPUBLICKEY);
    expect(methods).not.toContain(PermissionMethodNostr.NOSTR_DECRYPT);
  });

  test("keeps a permission that a preset still grants", async () => {
    // "I fully trust it" still grants encryption, so revoking it would prompt
    // those users for something their chosen preset covers
    await db.permissions.bulkAdd([
      permission(PermissionMethodNostr.NOSTR_ENCRYPT),
    ]);

    await migrate();

    const methods = (await db.permissions.toArray()).map((p) => p.method);
    expect(methods).toContain(PermissionMethodNostr.NOSTR_ENCRYPT);
  });

  test("leaves blocked entries alone - a block is a denial, not a grant", async () => {
    await db.permissions.bulkAdd([
      permission(PermissionMethodNostr.NOSTR_DECRYPT, true),
    ]);

    await migrate();

    const rows = await db.permissions.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0].blocked).toBe(true);
  });

  test("runs after the nip04/nip44 rename migrations", async () => {
    // an old-format row is renamed to nostr/decrypt first, then revoked
    alreadyMigrated = [];
    await db.permissions.bulkAdd([permission("nostr/nip04decrypt")]);
    await db.allowances.clear();
    await db.allowances.add({
      host: "example.com",
      name: "Example",
      imageURL: "",
      enabledFor: ["nostr"],
      enabled: true,
      lastPaymentAt: 0,
      totalBudget: 0,
      remainingBudget: 0,
      createdAt: "0",
      lnurlAuth: false,
      tag: "",
    });

    await migrate();

    const methods = (await db.permissions.toArray()).map((p) => p.method);
    expect(methods).not.toContain("nostr/decrypt");
    expect(methods).not.toContain("nostr/nip04decrypt");
  });
});
