import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import Nostr from "~/extension/background-script/nostr";
import { allowanceFixture } from "~/fixtures/allowances";
import { permissionsFixture } from "~/fixtures/permissions";
import type { MessageSignSchnorr, OriginData } from "~/types";

import signSchnorr from "../signSchnorrOrPrompt";

// suppress console logs when running tests
console.error = jest.fn();

jest.mock("~/common/lib/utils", () => ({
  openPrompt: jest.fn(() => Promise.resolve({ data: {} })),
}));

let nostr: Nostr;
const NostrClass = jest.fn().mockImplementation(() => {
  return nostr;
});

jest.mock("~/extension/background-script/state", () => ({
  getState: () => ({
    getNostr: jest.fn(() => new NostrClass()),
    currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
  }),
}));

const allowanceInDB = allowanceFixture[0];

const permissionInDB = {
  ...permissionsFixture[0],
  method: "nostr/signSchnorr",
};

const message: MessageSignSchnorr = {
  action: "signSchnorr",
  origin: { host: allowanceInDB.host } as OriginData,
  args: {
    sigHash: "sighash12345",
  },
};

const requestResponse = { data: "" };
const fullNostr = {
  signSchnorr: jest.fn(() => Promise.resolve(requestResponse.data)),
} as unknown as Nostr;

// prepare DB with allowance
db.allowances.bulkAdd([allowanceInDB]);

// resets after every test
afterEach(async () => {
  jest.clearAllMocks();
  // ensure a clear permission table in DB
  await db.permissions.clear();
  // set a default connector if overwritten in a previous test
  nostr = fullNostr;
});

describe("signSchnorr", () => {
  describe("throws error", () => {
    test("if the host's allowance does not exist", async () => {
      const messageWithUndefinedAllowanceHost = {
        ...message,
        origin: {
          ...message.origin,
          host: "some-host",
        },
      };

      const result = await signSchnorr(messageWithUndefinedAllowanceHost);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        error: "Could not find an allowance for this host",
      });
    });

    test("if the message args are not correct", async () => {
      const messageWithoutSigHash = {
        ...message,
        args: {
          ...message.args,
          sigHash: undefined,
        },
      } as unknown as MessageSignSchnorr;

      const result = await signSchnorr(messageWithoutSigHash);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        error: "sigHash is missing or not correct",
      });
    });
  });

  describe("directly calls signSchnorr with method and params", () => {
    test("if permission for signSchnorr exists and is enabled", async () => {
      // prepare DB with matching permission
      await db.permissions.bulkAdd([permissionInDB]);

      const result = await signSchnorr(message);

      expect(result).toStrictEqual(requestResponse);
      expect(nostr.signSchnorr).toHaveBeenCalledWith(message.args.sigHash);

      expect(utils.openPrompt).not.toHaveBeenCalled();

      expect(result).toStrictEqual(requestResponse);
    });
  });

  describe("prompts the user first and then calls signSchnorr", () => {
    test("if the permission for signSchnorr does not exist", async () => {
      // prepare DB with other permission
      const otherPermission = {
        ...permissionInDB,
        method: "nostr/getPublicKey",
      };
      await db.permissions.bulkAdd([otherPermission]);

      const result = await signSchnorr(message);

      expect(utils.openPrompt).toHaveBeenCalledWith({
        args: {
          sigHash: message.args.sigHash,
        },
        origin: message.origin,
        action: "public/nostr/confirmSignSchnorr",
      });
      expect(nostr.signSchnorr).toHaveBeenCalledWith(message.args.sigHash);
      expect(result).toStrictEqual(requestResponse);
    });

    test("if the permission for signSchnorr exists but is not enabled", async () => {
      // prepare DB with disabled permission
      const disabledPermission = {
        ...permissionInDB,
        enabled: false,
      };
      await db.permissions.bulkAdd([disabledPermission]);

      const result = await signSchnorr(message);

      expect(utils.openPrompt).toHaveBeenCalledWith({
        args: {
          sigHash: message.args.sigHash,
        },
        origin: message.origin,
        action: "public/nostr/confirmSignSchnorr",
      });
      expect(nostr.signSchnorr).toHaveBeenCalledWith(message.args.sigHash);
      expect(result).toStrictEqual(requestResponse);
    });
  });

  describe("on the user's prompt response", () => {
    test("saves the permission if enabled 'true'", async () => {
      (utils.openPrompt as jest.Mock).mockResolvedValueOnce({
        data: { enabled: true, blocked: false },
      });
      // prepare DB with a permission
      await db.permissions.bulkAdd([
        { ...permissionInDB, method: "nostr/getPublicKey" },
      ]);

      expect(await db.permissions.toArray()).toHaveLength(1);
      expect(
        await db.permissions.get({ method: "nostr/signSchnorr" })
      ).toBeUndefined();

      const result = await signSchnorr(message);

      expect(utils.openPrompt).toHaveBeenCalledTimes(1);

      expect(nostr.signSchnorr).toHaveBeenCalledWith(message.args.sigHash);

      expect(await db.permissions.toArray()).toHaveLength(2);

      const addedPermission = await db.permissions.get({
        method: "nostr/signSchnorr",
      });
      expect(addedPermission).toEqual(
        expect.objectContaining({
          method: "nostr/signSchnorr",
          enabled: true,
          allowanceId: allowanceInDB.id,
          host: allowanceInDB.host,
          blocked: false,
        })
      );

      expect(result).toStrictEqual(requestResponse);
    });

    test("doesn't call signSchnorr if clicks cancel", async () => {
      (utils.openPrompt as jest.Mock).mockImplementationOnce(() => {
        throw new Error();
      });
      // prepare DB with a permission
      await db.permissions.bulkAdd([
        { ...permissionInDB, method: "nostr/getPublicKey" },
      ]);

      expect(await db.permissions.toArray()).toHaveLength(1);
      expect(
        await db.permissions.get({ method: "nostr/signSchnorr" })
      ).toBeUndefined();

      const result = await signSchnorr(message);

      expect(utils.openPrompt).toHaveBeenCalledTimes(1);

      expect(nostr.signSchnorr).not.toHaveBeenCalled();

      expect(await db.permissions.toArray()).toHaveLength(1);
      expect(
        await db.permissions.get({ method: "nostr/signSchnorr" })
      ).toBeUndefined();

      expect(result).toHaveProperty("error");
    });

    test("does not save the permission if enabled 'false'", async () => {
      (utils.openPrompt as jest.Mock).mockResolvedValueOnce({
        data: { enabled: false, blocked: false },
      });
      // prepare DB with a permission
      await db.permissions.bulkAdd([
        { ...permissionInDB, method: "nostr/getPublicKey" },
      ]);

      expect(await db.permissions.toArray()).toHaveLength(1);
      expect(
        await db.permissions.get({ method: "nostr/signSchnorr" })
      ).toBeUndefined();

      const result = await signSchnorr(message);

      expect(utils.openPrompt).toHaveBeenCalledTimes(1);

      expect(nostr.signSchnorr).toHaveBeenCalledWith(message.args.sigHash);

      expect(await db.permissions.toArray()).toHaveLength(1);
      expect(
        await db.permissions.get({ method: "nostr/signSchnorr" })
      ).toBeUndefined();

      expect(result).toStrictEqual(requestResponse);
    });
  });
});
