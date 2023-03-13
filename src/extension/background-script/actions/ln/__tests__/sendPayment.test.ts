import type Connector from "~/extension/background-script/connectors/connector.interface";
import type { SendPaymentResponse } from "~/extension/background-script/connectors/connector.interface";
import { allowanceFixture } from "~/fixtures/allowances";
import type { MessageSendPayment, OriginData } from "~/types";

import sendPayment from "../sendPayment";

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

const message: MessageSendPayment = {
  action: "sendPayment",
  application: "LBE",
  args: {
    paymentRequest:
      "lnbc10n1p3st44mpp5j7dtqa0t6jctujwl8q8v07kaz363cva058l6pf4zyjv64qvuk9fshp5rdh2y59nhv3va0xqg7fmevcmypfw0e3pjq4p6yy52nu4jv76wmqqcqzpgxqyz5vqsp5lal7ervygjs3qpfvglzn472ag2e3w939mfckctpawsjyl3sslc6q9qyyssqvdjlxvgc0zrcn4ze44479x24w7r2svqv8zsp3ezemd55pdkxzwrjeeql0hvuy3d9klsmqzf8rwar8x4cplpxccnaj667p537g46txtqpxkyeuu",
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
  sendPayment: jest.fn(() => Promise.resolve(requestResponse)),
} as unknown as Connector;

// resets after every test
afterEach(async () => {
  jest.clearAllMocks();
  // set a default connector if overwritten in a previous test
  connector = fullConnector;
});

describe("ln sendPayment", () => {
  describe("throws error", () => {
    test("if the message doesn't have paymentRequest", async () => {
      const messageWithoutAmount = {
        ...message,
        args: {},
      };

      const result = await sendPayment(messageWithoutAmount);

      expect(result).toStrictEqual({
        error: "Payment request missing.",
      });
    });

    test("if the paymentRequest is invalid", async () => {
      const invalidPaymentRequest = "lnbcxyz";
      const messageWithoutDestination = {
        ...message,
        args: {
          paymentRequest: invalidPaymentRequest,
        },
      };

      const result = await sendPayment(messageWithoutDestination);

      expect(result).toStrictEqual({
        error: `${invalidPaymentRequest} too short`,
      });
    });
  });

  describe("makes a successful payment", () => {
    test("if paymentRequest is valid", async () => {
      const result = await sendPayment(message);
      expect(result).toStrictEqual(requestResponse);
    });
  });
});
