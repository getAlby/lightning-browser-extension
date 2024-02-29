import utils from "~/common/lib/utils";
import type Connector from "~/extension/background-script/connectors/connector.interface";
import db from "~/extension/background-script/db";
import type { MessageGenericRequest, OriginData } from "~/types";

import request from "../request";

// suppress console logs when running tests
console.error = jest.fn();

jest.mock("~/common/lib/utils", () => ({
  openPrompt: jest.fn(() => Promise.resolve({ data: {} })),
}));

// overwrite "connector" in tests later
let connector: Connector;
const ConnectorClass = jest.fn().mockImplementation(() => {
  return connector;
});

jest.mock("~/extension/background-script/state", () => ({
  getState: () => ({
    getConnector: jest.fn(() => Promise.resolve(new ConnectorClass())),
    currentAccountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
  }),
}));

const allowanceInDB = {
  enabled: true,
  host: "getalby.com",
  id: 1,
  imageURL: "https://getalby.com/favicon.ico",
  lastPaymentAt: 0,
  lnurlAuth: true,
  name: "Alby: Your Bitcoin & Nostr companion for the web",
  remainingBudget: 500,
  totalBudget: 500,
  createdAt: "123456",
  tag: "",
};

const permissionInDB = {
  id: 1,
  accountId: "8b7f1dc6-ab87-4c6c-bca5-19fa8632731e",
  allowanceId: allowanceInDB.id,
  createdAt: "1487076708000",
  host: allowanceInDB.host,
  method: "webln/lnd/listchannels",
  blocked: false,
  enabled: true,
};

const message: MessageGenericRequest = {
  action: "request",
  origin: { host: allowanceInDB.host } as OriginData,
  args: {
    method: "listchannels",
    params: {},
  },
};

const requestResponse = { data: [] };
const fullConnector = {
  // hacky fix because Jest doesn't return constructor name
  constructor: {
    name: "lnd",
  },
  requestMethod: jest.fn(() => Promise.resolve(requestResponse)),
  supportedMethods: [
    // saved and compared in lowercase
    "request.listchannels",
    "request.listpeers",
  ],
} as unknown as Connector;

// prepare DB with allowance
db.allowances.bulkAdd([allowanceInDB]);

// resets after every test
afterEach(async () => {
  jest.clearAllMocks();
  // ensure a clear permission table in DB
  await db.permissions.clear();
  // set a default connector if overwritten in a previous test
  connector = fullConnector;
});

describe("ln request", () => {
  describe("throws error", () => {
    test("if connector does not support requestMethod", async () => {
      connector = {
        ...fullConnector,
        supportedMethods: ["request.routermc"],
      };

      const result = await request(message);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        error: "listchannels is not supported by your account",
      });
    });

    test("with unsupported method in message", async () => {
      const messageWithUnsupportedMethod = {
        ...message,
        args: {
          ...message.args,
          method: "methodWithCamelCase",
        },
      };

      const result = await request(messageWithUnsupportedMethod);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        error: "methodwithcamelcase is not supported by your account",
      });
    });

    test("if the host's allowance does not exist", async () => {
      const messageWithUndefinedAllowanceHost = {
        ...message,
        origin: {
          ...message.origin,
          host: "some-host",
        },
      };

      const result = await request(messageWithUndefinedAllowanceHost);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        error: "Could not find an allowance for this host",
      });
    });

    test("if the request itself throws", async () => {
      connector = {
        ...fullConnector,
        requestMethod: jest.fn(() =>
          Promise.reject(new Error("Some API error"))
        ),
      };

      const result = await request(message);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        error: "Some API error",
      });
    });

    test("if the message args are not correct", async () => {
      const messageWithoutMethod = {
        ...message,
        args: {
          ...message.args,
          method: undefined,
        },
      } as unknown as MessageGenericRequest;

      const result = await request(messageWithoutMethod);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        error: "Request method is missing or not correct",
      });
    });
  });

  describe("directly calls requestMethod of Connector with method and params", () => {
    test("if permission for this request exists and is enabled", async () => {
      // prepare DB with matching permission
      await db.permissions.bulkAdd([permissionInDB]);

      const result = await request(message);

      expect(connector.requestMethod).toHaveBeenCalledWith(
        message.args.method.toLowerCase(),
        message.args.params
      );

      expect(utils.openPrompt).not.toHaveBeenCalled();

      expect(result).toStrictEqual(requestResponse);
    });
  });

  describe("prompts the user first and then calls requestMethod", () => {
    test("if the permission for this request does not exist", async () => {
      // prepare DB with other permission
      const otherPermission = {
        ...permissionInDB,
        method: "webln/sendpayment",
      };
      await db.permissions.bulkAdd([otherPermission]);

      const result = await request(message);

      expect(utils.openPrompt).toHaveBeenCalledWith({
        args: {
          requestPermission: {
            method: message.args.method.toLowerCase(),
            description: "lnd.listchannels",
          },
        },
        origin: message.origin,
        action: "public/confirmRequestPermission",
      });
      expect(connector.requestMethod).toHaveBeenCalledWith(
        message.args.method.toLowerCase(),
        message.args.params
      );
      expect(result).toStrictEqual(requestResponse);
    });

    test("if the permission for this request exists but is not enabled", async () => {
      // prepare DB with disabled permission
      const disabledPermission = {
        ...permissionInDB,
        enabled: false,
      };
      await db.permissions.bulkAdd([disabledPermission]);

      const result = await request(message);

      expect(utils.openPrompt).toHaveBeenCalledWith({
        args: {
          requestPermission: {
            method: message.args.method.toLowerCase(),
            description: "lnd.listchannels",
          },
        },
        origin: message.origin,
        action: "public/confirmRequestPermission",
      });
      expect(connector.requestMethod).toHaveBeenCalledWith(
        message.args.method.toLowerCase(),
        message.args.params
      );
      expect(result).toStrictEqual(requestResponse);
    });
  });

  describe("on the user's prompt response", () => {
    test("saves the permission if enabled 'true'", async () => {
      (utils.openPrompt as jest.Mock).mockResolvedValueOnce({
        data: { enabled: true, blocked: false },
      });
      // prepare DB with a permission
      await db.permissions.bulkAdd([permissionInDB]);

      const listPeersMessage = {
        ...message,
        args: {
          ...message.args,
          method: "listpeers",
        },
      };

      expect(await db.permissions.toArray()).toHaveLength(1);
      expect(
        await db.permissions.get({ method: "webln/lnd/listpeers" })
      ).toBeUndefined();

      const result = await request(listPeersMessage);

      expect(utils.openPrompt).toHaveBeenCalledTimes(1);

      expect(connector.requestMethod).toHaveBeenCalledWith(
        listPeersMessage.args.method.toLowerCase(),
        listPeersMessage.args.params
      );

      expect(await db.permissions.toArray()).toHaveLength(2);

      const addedPermission = await db.permissions.get({
        method: "webln/lnd/listchannels",
      });
      expect(addedPermission).toEqual(
        expect.objectContaining({
          method: "webln/lnd/listchannels",
          enabled: true,
          allowanceId: allowanceInDB.id,
          host: allowanceInDB.host,
          blocked: false,
        })
      );

      expect(result).toStrictEqual(requestResponse);
    });

    test("doesn't call requestMethod if clicks cancel", async () => {
      (utils.openPrompt as jest.Mock).mockImplementationOnce(() => {
        throw new Error();
      });
      // prepare DB with a permission
      await db.permissions.bulkAdd([permissionInDB]);

      const messageWithOtherPermission = {
        ...message,
        args: {
          ...message.args,
          method: "listpeers",
        },
      };

      expect(await db.permissions.toArray()).toHaveLength(1);
      expect(
        await db.permissions.get({ method: "webln/lnd/listpeers" })
      ).toBeUndefined();

      const result = await request(messageWithOtherPermission);

      expect(utils.openPrompt).toHaveBeenCalledTimes(1);

      expect(connector.requestMethod).not.toHaveBeenCalled();

      expect(await db.permissions.toArray()).toHaveLength(1);
      expect(
        await db.permissions.get({ method: "webln/lnd/listpeers" })
      ).toBeUndefined();

      expect(result).toHaveProperty("error");
    });

    test("does not save the permission if enabled 'false'", async () => {
      (utils.openPrompt as jest.Mock).mockResolvedValueOnce({
        data: { enabled: false, blocked: false },
      });
      // prepare DB with a permission
      await db.permissions.bulkAdd([permissionInDB]);

      const listPeersMessage = {
        ...message,
        args: {
          ...message.args,
          method: "listpeers",
        },
      };

      expect(await db.permissions.toArray()).toHaveLength(1);
      expect(
        await db.permissions.get({ method: "webln/lnd/listpeers" })
      ).toBeUndefined();

      const result = await request(listPeersMessage);

      expect(utils.openPrompt).toHaveBeenCalledTimes(1);

      expect(connector.requestMethod).toHaveBeenCalledWith(
        listPeersMessage.args.method.toLowerCase(),
        listPeersMessage.args.params
      );

      expect(await db.permissions.toArray()).toHaveLength(1);
      expect(
        await db.permissions.get({ method: "webln/lnd/listpeers" })
      ).toBeUndefined();

      expect(result).toStrictEqual(requestResponse);
    });
  });
});
