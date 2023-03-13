import type Connector from "~/extension/background-script/connectors/connector.interface";
import type { SendPaymentResponse } from "~/extension/background-script/connectors/connector.interface";
import { allowanceFixture } from "~/fixtures/allowances";
import type { Message, OriginData } from "~/types";

import keysend from "../keysend";

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

const allowanceInDB = allowanceFixture[0];

const message: Message = {
  action: "keysend",
  application: "LBE",
  args: {
    destination:
      "030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3",
    amount: "1000",
    customRecords: {
      customKey: "696969",
      customValue: "abcdefgh",
    },
  },
  origin: { host: allowanceInDB.host } as OriginData,
  prompt: true,
};

const requestResponse: SendPaymentResponse = {
  data: {
    preimage: "123",
    paymentHash: "123",
    route: {
      total_amt: 1000,
      total_fees: 2,
    },
  },
};
const fullConnector = {
  // hacky fix because Jest doesn't return constructor name
  constructor: {
    name: "lnd",
  },
  keysend: jest.fn(() => Promise.resolve(requestResponse)),
} as unknown as Connector;

// resets after every test
afterEach(async () => {
  jest.clearAllMocks();
  // set a default connector if overwritten in a previous test
  connector = fullConnector;
});

describe("ln keysend", () => {
  describe("throws error", () => {
    test("if the message doesn't have amount", async () => {
      const messageWithoutAmount = {
        ...message,
        args: {
          destination:
            "030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3",
          customRecords: {
            customKey: "696969",
            customValue: "abcdefgh",
          },
        },
      };

      const result = await keysend(messageWithoutAmount);

      expect(result).toStrictEqual({
        error: "Destination or amount missing.",
      });
    });

    test("if the message doesn't have destination", async () => {
      const messageWithoutDestination = {
        ...message,
        args: {
          amount: "1000",
          customRecords: {
            customKey: "696969",
            customValue: "abcdefgh",
          },
        },
      };

      const result = await keysend(messageWithoutDestination);

      expect(result).toStrictEqual({
        error: "Destination or amount missing.",
      });
    });
  });

  describe("makes a successful payment", () => {
    test("if amount, destination and custom records are provided", async () => {
      const result = await keysend(message);
      expect(result).toStrictEqual(requestResponse);
    });
  });
});
