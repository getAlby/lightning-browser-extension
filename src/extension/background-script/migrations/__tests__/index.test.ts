import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import { permissionsFixture } from "~/fixtures/permissions";

import migrate from "../index";

jest.mock("~/extension/background-script/state", () => ({
  getState: () => ({
    // the earlier migrations already ran
    migrations: ["migrateEncryptPermission", "migrateDecryptPermission"],
    saveToStorage: () => Promise.resolve(),
  }),
  setState: jest.fn(),
}));

const allowanceInDB = allowanceFixture[0];

beforeAll(async () => {
  await db.allowances.bulkAdd([allowanceInDB]);
});

beforeEach(async () => {
  await db.permissions.clear();
  jest.clearAllMocks();
});

describe("removeSchnorrSigningApprovals", () => {
  test("drops a stored signSchnorr approval", async () => {
    await db.permissions.bulkAdd([
      { ...permissionsFixture[0], method: "nostr/signSchnorr", blocked: false },
    ]);

    await migrate();

    expect(
      await db.permissions.get({ method: "nostr/signSchnorr" })
    ).toBeUndefined();
  });

  test("keeps a signSchnorr block", async () => {
    await db.permissions.bulkAdd([
      { ...permissionsFixture[0], method: "nostr/signSchnorr", blocked: true },
    ]);

    await migrate();

    expect(await db.permissions.get({ method: "nostr/signSchnorr" })).toEqual(
      expect.objectContaining({ blocked: true })
    );
  });

  test("leaves other permissions alone", async () => {
    await db.permissions.bulkAdd([
      {
        ...permissionsFixture[0],
        method: "nostr/getPublicKey",
        blocked: false,
      },
    ]);

    await migrate();

    expect(
      await db.permissions.get({ method: "nostr/getPublicKey" })
    ).toBeDefined();
  });
});
