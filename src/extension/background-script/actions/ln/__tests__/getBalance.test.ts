import { getBalanceOrPrompt } from "~/extension/background-script/actions/webln";
import type Connector from "~/extension/background-script/connectors/connector.interface";
import type { GetBalanceResponse } from "~/extension/background-script/connectors/connector.interface";
import { MessageBalanceGet } from "~/types";

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
  }),
}));

const message: MessageBalanceGet = {
  action: "getBalance",
  application: "LBE",
  origin: { internal: true },
  prompt: true,
};

const requestResponse: GetBalanceResponse = {
  data: {
    balance: 123,
  },
};

const fullConnector = {
  // hacky fix because Jest doesn't return constructor name
  constructor: {
    name: "lnd",
  },
  signMessage: jest.fn(() => Promise.resolve(requestResponse)),
  supportedMethods: [
    // saved and compared in lowercase
    "getinfo",
    "makeinvoice",
    "sendpayment",
  ],
} as unknown as Connector;

// resets after every test
afterEach(async () => {
  jest.clearAllMocks();
  // set a default connector if overwritten in a previous test
  connector = fullConnector;
});

describe("ln getBalance", () => {
  describe("directly returns the current balance", () => {
    test("if permission for this request exists and is enabled", async () => {
      const result = await getBalanceOrPrompt(message);
      expect(result).toStrictEqual(requestResponse);
    });
  });
});
