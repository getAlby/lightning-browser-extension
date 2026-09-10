import lightningPayReq from "bolt11-signet";
import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import type { Message, Sender } from "~/types";

import sendPayment from "../../ln/sendPayment";
import { sendPaymentOrPrompt } from "../sendPaymentOrPrompt";

jest.mock("~/common/lib/utils", () => ({
  __esModule: true,
  default: { openPrompt: jest.fn(() => Promise.resolve({ data: {} })) },
}));

jest.mock("../../ln/sendPayment", () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({ data: {} })),
}));

// the allowance fixture for getalby.com has a remaining budget of 500 sats
const sender: Sender = { origin: "https://getalby.com" };

const PRIVATE_KEY = Buffer.from(
  "e126f68f7eafcc8b74f54d269fe206be715000f94dac067d1c04a8ca3b2db734",
  "hex"
);

function message(satoshis: number): Message {
  const encoded = lightningPayReq.encode({
    satoshis,
    tags: [
      {
        tagName: "payment_hash",
        data: "0001020304050607080900010203040506070809000102030405060708090102",
      },
      { tagName: "description", data: "test" },
    ],
  });
  const { paymentRequest } = lightningPayReq.sign(encoded, PRIVATE_KEY);
  return {
    application: "LBE",
    prompt: true,
    action: "sendPaymentOrPrompt",
    origin: { internal: true },
    args: { paymentRequest },
  };
}

describe("sendPaymentOrPrompt", () => {
  beforeEach(async () => {
    await db.allowances.clear();
    await db.allowances.bulkAdd(allowanceFixture);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("takes the amount out of the budget before paying", async () => {
    (sendPayment as jest.Mock).mockImplementationOnce(async () => {
      expect((await db.allowances.get(1))?.remainingBudget).toBe(400);
      return { data: {} };
    });

    await sendPaymentOrPrompt(message(100), sender);

    expect(sendPayment).toHaveBeenCalled();
    expect((await db.allowances.get(1))?.remainingBudget).toBe(400);
  });

  test("keeps the amount out of the budget when the payment fails", async () => {
    (sendPayment as jest.Mock).mockRejectedValueOnce(new Error("boom"));

    await sendPaymentOrPrompt(message(100), sender);

    expect((await db.allowances.get(1))?.remainingBudget).toBe(400);
  });

  test("concurrent payments cannot spend more than the budget", async () => {
    // five 200 sat payments against a 500 sat budget: only the two the budget
    // covers may reach the connector, the rest have to ask the user
    await Promise.all(
      [1, 2, 3, 4, 5].map(() => sendPaymentOrPrompt(message(200), sender))
    );

    expect(sendPayment).toHaveBeenCalledTimes(2);
    expect(utils.openPrompt).toHaveBeenCalledTimes(3);
    expect((await db.allowances.get(1))?.remainingBudget).toBe(100);
  });
});
