import lightningPayReq from "bolt11-signet";
import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import type { DbAllowance, Message, Sender } from "~/types";

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

const mockAllowances: DbAllowance[] = allowanceFixture;

// the allowance fixture for getalby.com has a remaining budget of 500 sats
const sender: Sender = { origin: "https://getalby.com" };

const PRIVATE_KEY = Buffer.from(
  "e126f68f7eafcc8b74f54d269fe206be715000f94dac067d1c04a8ca3b2db734",
  "hex"
);

function createPaymentRequest(millisatoshis?: number) {
  const encoded = lightningPayReq.encode({
    ...(millisatoshis !== undefined && {
      millisatoshis: String(millisatoshis),
    }),
    tags: [
      {
        tagName: "payment_hash",
        data: "0001020304050607080900010203040506070809000102030405060708090102",
      },
      { tagName: "description", data: "test" },
    ],
  });
  const { paymentRequest } = lightningPayReq.sign(encoded, PRIVATE_KEY);
  if (!paymentRequest) {
    throw new Error("Failed to encode payment request");
  }
  return paymentRequest;
}

function message(millisatoshis?: number): Message {
  return {
    application: "LBE",
    prompt: true,
    action: "sendPaymentOrPrompt",
    origin: { internal: true },
    args: { paymentRequest: createPaymentRequest(millisatoshis) },
  };
}

describe("sendPaymentOrPrompt", () => {
  // paying against a budget now takes the amount out of it, so each test needs
  // to start from the fixture budgets rather than whatever the last one left
  beforeEach(async () => {
    await db.allowances.clear();
    await db.allowances.bulkAdd(mockAllowances);
    await db.allowances.add({
      ...mockAllowances[0],
      id: 3,
      host: "nostr-only.example",
      enabledFor: ["nostr"],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("pays without a prompt when the amount is within the budget", async () => {
    await sendPaymentOrPrompt(message(100_000), sender);

    expect(sendPayment).toHaveBeenCalled();
    expect(utils.openPrompt).not.toHaveBeenCalled();
  });

  test("prompts when the amount exceeds the budget", async () => {
    await sendPaymentOrPrompt(message(600_000), sender);

    expect(utils.openPrompt).toHaveBeenCalled();
    expect(sendPayment).not.toHaveBeenCalled();
  });

  // a sub-satoshi amount leaves `satoshis` unset on the decoded invoice. Reading
  // it directly made this look like a 0 sat payment, so it cleared the budget
  // check and was paid without any confirmation.
  test("prompts for a sub-satoshi amount that exceeds the budget", async () => {
    await sendPaymentOrPrompt(message(50_000_001), sender);

    expect(utils.openPrompt).toHaveBeenCalled();
    expect(sendPayment).not.toHaveBeenCalled();
  });

  test("pays without a prompt for a sub-satoshi amount within the budget", async () => {
    await sendPaymentOrPrompt(message(100_500), sender);

    expect(sendPayment).toHaveBeenCalled();
    expect(utils.openPrompt).not.toHaveBeenCalled();
  });

  test("prompts for amountless invoices", async () => {
    await sendPaymentOrPrompt(message(), sender);

    expect(utils.openPrompt).toHaveBeenCalled();
    expect(sendPayment).not.toHaveBeenCalled();
  });

  // the lnmarkets.com fixture has a remaining budget but is disabled
  test("prompts when the allowance is disabled", async () => {
    await sendPaymentOrPrompt(message(100_000), {
      origin: "https://lnmarkets.com",
    });

    expect(utils.openPrompt).toHaveBeenCalled();
    expect(sendPayment).not.toHaveBeenCalled();
  });

  test("prompts when the allowance is not enabled for webln", async () => {
    await sendPaymentOrPrompt(message(100_000), {
      origin: "https://nostr-only.example",
    });

    expect(utils.openPrompt).toHaveBeenCalled();
    expect(sendPayment).not.toHaveBeenCalled();
  });

  test("prompts when the host has no allowance", async () => {
    await sendPaymentOrPrompt(message(50_000_001), {
      origin: "https://example.com",
    });

    expect(utils.openPrompt).toHaveBeenCalled();
    expect(sendPayment).not.toHaveBeenCalled();
  });

  test("takes the amount out of the budget before paying", async () => {
    await sendPaymentOrPrompt(message(100_000), sender);

    // the getalby.com fixture starts at 500 sats
    expect((await db.allowances.get(1))?.remainingBudget).toBe(400);
  });

  test("keeps the amount out of the budget when the payment fails", async () => {
    (sendPayment as jest.Mock).mockResolvedValueOnce({ error: "no route" });

    await sendPaymentOrPrompt(message(100_000), sender);

    expect((await db.allowances.get(1))?.remainingBudget).toBe(400);
  });

  test("keeps the amount out of the budget when the payment throws", async () => {
    (sendPayment as jest.Mock).mockRejectedValueOnce(new Error("boom"));

    const response = await sendPaymentOrPrompt(message(100_000), sender);

    expect(response).toEqual({ error: "boom" });
    expect((await db.allowances.get(1))?.remainingBudget).toBe(400);
  });

  test("concurrent payments cannot spend more than the budget", async () => {
    // five 200 sat payments against a 500 sat budget: only the two the budget
    // covers may reach the connector, the rest have to ask the user
    await Promise.all(
      [1, 2, 3, 4, 5].map(() => sendPaymentOrPrompt(message(200_000), sender))
    );

    expect(sendPayment).toHaveBeenCalledTimes(2);
    expect(utils.openPrompt).toHaveBeenCalledTimes(3);
    expect((await db.allowances.get(1))?.remainingBudget).toBe(100);
  });
});
