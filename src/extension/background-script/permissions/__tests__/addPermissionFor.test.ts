import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import { PermissionMethodNostr } from "~/types";

import { addPermissionFor } from "../addPermissionFor";

jest.mock("~/extension/background-script/state", () => ({
  getState: () => ({
    currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
  }),
}));

const allowanceInDB = allowanceFixture[0];

beforeAll(async () => {
  await db.allowances.bulkAdd([allowanceInDB]);
});

afterEach(async () => {
  await db.permissions.clear();
});

describe("addPermissionFor", () => {
  test("stores an approval for a regular method", async () => {
    const stored = await addPermissionFor(
      PermissionMethodNostr.NOSTR_GETPUBLICKEY,
      allowanceInDB.host,
      false
    );

    expect(stored).toBe(true);
    expect(
      await db.permissions.get({ method: "nostr/getPublicKey" })
    ).toBeDefined();
  });

  test("does not store an approval for signSchnorr", async () => {
    const stored = await addPermissionFor(
      PermissionMethodNostr.NOSTR_SIGNSCHNORR,
      allowanceInDB.host,
      false
    );

    expect(stored).toBe(false);
    expect(
      await db.permissions.get({ method: "nostr/signSchnorr" })
    ).toBeUndefined();
  });

  test("still stores a block for signSchnorr", async () => {
    const stored = await addPermissionFor(
      PermissionMethodNostr.NOSTR_SIGNSCHNORR,
      allowanceInDB.host,
      true
    );

    expect(stored).toBe(true);
    expect(await db.permissions.get({ method: "nostr/signSchnorr" })).toEqual(
      expect.objectContaining({ method: "nostr/signSchnorr", blocked: true })
    );
  });
});
