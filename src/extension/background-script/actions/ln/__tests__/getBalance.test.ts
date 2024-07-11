import utils from "~/common/lib/utils";
import { getBalanceOrPrompt } from "~/extension/background-script/actions/webln";
import type Connector from "~/extension/background-script/connectors/connector.interface";
import db from "~/extension/background-script/db";
import type { MessageBalanceGet, OriginData } from "~/types";

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
  method: "webln.getbalance",
  blocked: false,
  enabled: true,
};

const message: MessageBalanceGet = {
  action: "getBalance",
  origin: { host: allowanceInDB.host } as OriginData,
};

const requestResponse = { data: { balance: 123 } };
const fullConnector = {
  // hacky fix because Jest doesn't return constructor name
  constructor: {
    name: "lnd",
  },
  getBalance: jest.fn(() => Promise.resolve(requestResponse)),
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

describe("throws error", () => {
  test("if the host's allowance does not exist", async () => {
    const messageWithUndefinedAllowanceHost = {
      ...message,
      origin: {
        ...message.origin,
        host: "some-host",
      },
    };

    const result = await getBalanceOrPrompt(messageWithUndefinedAllowanceHost);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual({
      error: "Could not find an allowance for this host",
    });
  });

  test("if the getBalance call itself throws an exception", async () => {
    connector = {
      ...fullConnector,
      getBalance: jest.fn(() => Promise.reject(new Error("Some API error"))),
    };

    const result = await getBalanceOrPrompt(message);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual({
      error: "Some API error",
    });
  });
});

describe("prompts the user first and then calls getBalance", () => {
  test("if the permission for getBalance does not exist", async () => {
    // prepare DB with other permission
    const otherPermission = {
      ...permissionInDB,
      method: "webln/sendpayment",
    };
    await db.permissions.bulkAdd([otherPermission]);

    const result = await getBalanceOrPrompt(message);

    expect(utils.openPrompt).toHaveBeenCalledWith({
      args: {
        requestPermission: {
          method: "getBalance",
          description: "webln.getbalance.description",
        },
      },
      origin: message.origin,
      action: "public/confirmRequestPermission",
    });
    expect(connector.getBalance).toHaveBeenCalled();
    expect(result).toStrictEqual(requestResponse);
  });

  test("if the permission for the getBalance exists but is not enabled", async () => {
    // prepare DB with disabled permission
    const disabledPermission = {
      ...permissionInDB,
      enabled: false,
    };
    await db.permissions.bulkAdd([disabledPermission]);

    const result = await getBalanceOrPrompt(message);

    expect(utils.openPrompt).toHaveBeenCalledWith({
      args: {
        requestPermission: {
          method: "getBalance",
          description: "webln.getbalance.description",
        },
      },
      origin: message.origin,
      action: "public/confirmRequestPermission",
    });
    expect(connector.getBalance).toHaveBeenCalled();
    expect(result).toStrictEqual(requestResponse);
  });
});

describe("directly calls getBalance of Connector", () => {
  test("if permission for this website exists and is enabled", async () => {
    // prepare DB with matching permission
    await db.permissions.bulkAdd([permissionInDB]);

    // console.log(db.permissions);
    const result = await getBalanceOrPrompt(message);

    expect(connector.getBalance).toHaveBeenCalled();
    expect(utils.openPrompt).not.toHaveBeenCalled();
    expect(result).toStrictEqual(requestResponse);
  });
});
