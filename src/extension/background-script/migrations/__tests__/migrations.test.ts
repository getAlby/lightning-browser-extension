import db from "~/extension/background-script/db";
import type { DbPermission } from "~/types";

import migrate from "../index";

// suppress console logs when running tests
console.info = jest.fn();

jest.mock("~/extension/background-script/state", () => ({
  getState: () => ({
    migrations: [],
    saveToStorage: jest.fn(() => Promise.resolve()),
  }),
  setState: jest.fn(),
}));

const permission = {
  accountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
  allowanceId: 1,
  createdAt: "1487076708000",
  host: "getalby.com",
  blocked: false,
  enabled: true,
};

const permissionsInDB: DbPermission[] = [
  { ...permission, id: 1, method: "webln/lnd/sendtoroute" },
  { ...permission, id: 2, method: "webln/lnc/openchannel" },
  { ...permission, id: 3, method: "webln/lnd/settleinvoice" },
  { ...permission, id: 4, method: "webln/lnd/listchannels" },
  // written by a build that mangled the name of the connector class
  { ...permission, id: 5, method: "webln/e/listchannels" },
  { ...permission, id: 6, method: "webln/getbalance" },
  { ...permission, id: 7, method: "nostr/getpublickey" },
];

beforeEach(async () => {
  await db.permissions.clear();
  await db.permissions.bulkAdd(permissionsInDB);
});

describe("migrateRequestMethodPermissions", () => {
  test("removes the stored permissions of request methods", async () => {
    await migrate();

    const methods = (await db.permissions.toArray()).map(
      (permission) => permission.method
    );

    expect(methods).toEqual(["webln/getbalance", "nostr/getpublickey"]);
  });
});
