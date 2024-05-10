import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import Nostr from "~/extension/background-script/nostr";
import { allowanceFixture } from "~/fixtures/allowances";
import { permissionsFixture } from "~/fixtures/permissions";
import {
  MessageSignEvent,
  PermissionOption,
  type OriginData,
  type Sender,
} from "~/types";

import signEvent from "../signEventOrPrompt";

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
  method: "nostr/signMessage/1",
};

const message: MessageSignEvent = {
  action: "signEvent",
  origin: { host: allowanceInDB.host } as OriginData,
  args: {
    event: {
      content: "sign short note",
      created_at: 1714716414,
      kind: 1,
      tags: [],
    },
  },
};

const sender: Sender = {
  documentId: "ALBY123",
  documentLifecycle: "active",
  id: "alby",
  origin: `https://${allowanceInDB.host}`,
  url: `https://${allowanceInDB.host}/test`,
};

const requestResponse = { data: MessageEvent };
const fullNostr = {
  signEvent: jest.fn(() => Promise.resolve(requestResponse.data)),
  getPublicKey: jest.fn(() => Promise.resolve(String)),
  getEventHash: jest.fn(() => Promise.resolve(String)),
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

describe("signEvent", () => {
  describe("throws error", () => {
    test("if the host's allowance does not exist", async () => {
      const senderWithUndefinedAllowanceHost = {
        ...sender,
        origin: `https://some-host.com`,
      };

      const result = await signEvent(message, senderWithUndefinedAllowanceHost);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        error: "Could not find an allowance for this host",
      });
    });
  });

  describe("directly calls signEvent with method and params", () => {
    test("if permission for signEvent exists and is enabled", async () => {
      // prepare DB with matching permission

      await db.permissions.bulkAdd([permissionInDB]);

      const result = await signEvent(message, sender);

      expect(result).toStrictEqual(requestResponse);
      expect(nostr.signEvent).toHaveBeenCalledWith(message.args.event);

      expect(utils.openPrompt).not.toHaveBeenCalled();

      expect(result).toStrictEqual(requestResponse);
    });
  });

  describe("prompts the user first and then calls signEvent", () => {
    test("if the permission for signEvent does not exist", async () => {
      // prepare DB with other permission
      const otherPermission = {
        ...permissionInDB,
        method: "nostr/getPublicKey",
      };
      await db.permissions.bulkAdd([otherPermission]);

      await signEvent(message, sender);

      expect(utils.openPrompt).toHaveBeenCalledWith({
        args: {
          event: message.args.event,
        },
        origin: message.origin,
        action: "public/nostr/confirmSignMessage",
      });
    });
  });

  describe("on the user's prompt response", () => {
    test("saves the permission if permissionOption is dont_ask_current", async () => {
      (utils.openPrompt as jest.Mock).mockResolvedValueOnce({
        data: {
          permissionOption: PermissionOption.DONT_ASK_CURRENT,
          blocked: false,
          confirm: true,
        },
      });
      // prepare DB with a permission
      await db.permissions.bulkAdd([
        { ...permissionInDB, method: "nostr/getPublicKey" },
      ]);

      expect(await db.permissions.toArray()).toHaveLength(1);
      expect(
        await db.permissions.get({ method: "nostr/signMessage/1" })
      ).toBeUndefined();

      const result = await signEvent(message, sender);

      expect(utils.openPrompt).toHaveBeenCalledTimes(1);

      expect(nostr.signEvent).toHaveBeenCalledWith(message.args.event);

      expect(await db.permissions.toArray()).toHaveLength(2);

      const addedPermission = await db.permissions.get({
        method: "nostr/signMessage/1",
      });
      expect(addedPermission).toEqual(
        expect.objectContaining({
          method: "nostr/signMessage/1",
          enabled: true,
          allowanceId: allowanceInDB.id,
          host: allowanceInDB.host,
          blocked: false,
        })
      );

      expect(result).toStrictEqual(requestResponse);
    });

    test("doesn't call signEvent if clicks deny", async () => {
      // prepare DB with a permission
      await db.permissions.bulkAdd([
        { ...permissionInDB, method: "nostr/getPublicKey" },
      ]);

      expect(await db.permissions.toArray()).toHaveLength(1);
      expect(
        await db.permissions.get({ method: "nostr/signMessage/1" })
      ).toBeUndefined();

      const result = await signEvent(message, sender);

      expect(utils.openPrompt).toHaveBeenCalledTimes(1);

      expect(nostr.signEvent).not.toHaveBeenCalled();

      expect(await db.permissions.toArray()).toHaveLength(1);
      expect(
        await db.permissions.get({ method: "nostr/signMessage/1" })
      ).toBeUndefined();

      expect(result).toHaveProperty("error");
    });

    test("does not save the permission if permissionOption is 'ASK_EVERYTIME'", async () => {
      (utils.openPrompt as jest.Mock).mockResolvedValueOnce({
        data: {
          confirm: true,
          blocked: false,
          permissionOption: PermissionOption.ASK_EVERYTIME,
        },
      });
      // prepare DB with a permission
      await db.permissions.bulkAdd([
        { ...permissionInDB, method: "nostr/getPublicKey" },
      ]);

      expect(await db.permissions.toArray()).toHaveLength(1);
      expect(
        await db.permissions.get({ method: "nostr/signMessage/1" })
      ).toBeUndefined();

      const result = await signEvent(message, sender);

      expect(utils.openPrompt).toHaveBeenCalledTimes(1);

      expect(nostr.signEvent).toHaveBeenCalledWith(message.args.event);

      expect(await db.permissions.toArray()).toHaveLength(1);
      expect(
        await db.permissions.get({ method: "nostr/signMessage/1" })
      ).toBeUndefined();

      expect(result).toStrictEqual(requestResponse);
    });
  });
});
