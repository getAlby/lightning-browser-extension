import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import Nostr from "~/extension/background-script/nostr";
import { allowanceFixture } from "~/fixtures/allowances";
import { permissionsFixture } from "~/fixtures/permissions";
import {
  PermissionOption,
  type MessageSignSchnorr,
  type OriginData,
  type Sender,
} from "~/types";

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
    message: "auth challenge 12345",
  },
};

const sender: Sender = {
  documentId: "ALBY123",
  documentLifecycle: "active",
  id: "alby",
  origin: `https://${allowanceInDB.host}`,
  url: `https://${allowanceInDB.host}/test`,
};

const requestResponse = { data: "" };
const fullNostr = {
  hashAndSignSchnorr: jest.fn(() => Promise.resolve(requestResponse.data)),
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
      const senderWithUndefinedAllowanceHost = {
        ...sender,
        origin: `https://some-host.com`,
      };

      const result = await signSchnorr(
        message,
        senderWithUndefinedAllowanceHost
      );

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        error: "Could not find an allowance for this host",
      });
    });

    test("if the message args are not correct", async () => {
      const messageWithoutMessage = {
        ...message,
        args: {},
      } as unknown as MessageSignSchnorr;

      const result = await signSchnorr(messageWithoutMessage, sender);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        error: "message is missing or not correct",
      });
    });

    test("if the message is a serialized nostr event", async () => {
      const serializedEvent = JSON.stringify([
        0,
        "4f355bdcb7cc0af728ef3cceb9615d90684bb5b2ca5f859ab0f0b704075871aa",
        1785942594,
        0,
        [],
        '{"lud16":"attacker@example.com"}',
      ]);

      const result = await signSchnorr(
        { ...message, args: { message: serializedEvent } },
        sender
      );

      expect(result).toStrictEqual({
        error:
          "nostr events must be signed with signEvent, not hashAndSignSchnorr",
      });
      expect(utils.openPrompt).not.toHaveBeenCalled();
      expect(nostr.hashAndSignSchnorr).not.toHaveBeenCalled();
    });
  });

  describe("always prompts", () => {
    test("even if a permission for signSchnorr is stored and enabled", async () => {
      await db.permissions.bulkAdd([permissionInDB]);

      await signSchnorr(message, sender);

      expect(utils.openPrompt).toHaveBeenCalledWith({
        args: {
          message: message.args.message,
        },
        origin: message.origin,
        action: "public/nostr/confirmSignSchnorr",
      });
    });

    test("unless the permission is blocked", async () => {
      await db.permissions.bulkAdd([{ ...permissionInDB, blocked: true }]);

      const result = await signSchnorr(message, sender);

      expect(result).toStrictEqual({ denied: true });
      expect(utils.openPrompt).not.toHaveBeenCalled();
      expect(nostr.hashAndSignSchnorr).not.toHaveBeenCalled();
    });
  });

  describe("on the user's prompt response", () => {
    test("signs the message on confirm", async () => {
      (utils.openPrompt as jest.Mock).mockResolvedValueOnce({
        data: { blocked: false, confirm: true },
      });

      const result = await signSchnorr(message, sender);

      expect(nostr.hashAndSignSchnorr).toHaveBeenCalledWith(
        message.args.message
      );
      expect(result).toStrictEqual(requestResponse);
    });

    test("doesn't sign if the user cancels", async () => {
      const result = await signSchnorr(message, sender);

      expect(utils.openPrompt).toHaveBeenCalledTimes(1);
      expect(nostr.hashAndSignSchnorr).not.toHaveBeenCalled();
      expect(result).toHaveProperty("error");
    });

    test("never stores an approval, whatever the prompt replies", async () => {
      (utils.openPrompt as jest.Mock).mockResolvedValueOnce({
        data: {
          permissionOption: PermissionOption.DONT_ASK_CURRENT,
          blocked: false,
          confirm: true,
        },
      });

      const result = await signSchnorr(message, sender);

      expect(result).toStrictEqual(requestResponse);
      expect(
        await db.permissions.get({ method: "nostr/signSchnorr" })
      ).toBeUndefined();
    });
  });
});
