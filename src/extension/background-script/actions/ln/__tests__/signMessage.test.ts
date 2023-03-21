import type Connector from "~/extension/background-script/connectors/connector.interface";
import type { SignMessageResponse } from "~/extension/background-script/connectors/connector.interface";
import type { Message } from "~/types";

import signMessage from "../signMessage";

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

const message: Message = {
  action: "signMessage",
  application: "LBE",
  args: { message: "hello sign me" },
  origin: { internal: true },
  prompt: true,
};

const requestResponse: SignMessageResponse = {
  data: {
    message: "hello sign me",
    signature: "123456789",
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

describe("ln signMessage", () => {
  describe("throws error", () => {
    test("if the message consists of canonical strings", async () => {
      const messageWithCanonicalString = {
        ...message,
        args: {
          message: "DO NOT EVER SIGN THIS TEXT",
        },
      };

      const result = await signMessage(messageWithCanonicalString);

      expect(result).toStrictEqual({
        error: "forbidden",
      });
    });

    test("if the message is not of type string", async () => {
      const messageWithNumber = {
        ...message,
        args: {
          message: 12345,
        },
      };

      const result = await signMessage(messageWithNumber);

      expect(result).toStrictEqual({
        error: "Message missing.",
      });
    });
  });

  describe("directly signs the message", () => {
    test("if permission for this request exists and is enabled", async () => {
      const result = await signMessage(message);

      expect(result).toStrictEqual(requestResponse);
    });
  });
});
