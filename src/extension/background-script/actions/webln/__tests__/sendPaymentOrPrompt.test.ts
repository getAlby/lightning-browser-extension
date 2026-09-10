import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import { createPaymentRequest } from "~/fixtures/paymentRequests";
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
  // the tests debit the budget, so start every one from the fixture
  beforeEach(async () => {
    await db.allowances.clear();
    await db.allowances.bulkAdd(mockAllowances);
    await db.allowances.add({
      ...mockAllowances[0],
      id: 3,
      host: "nostr-only.example",
      enabledFor: ["nostr"],
    });
    // enabled for webln with budget to spare, only the `enabled` flag denies it
    await db.allowances.add({
      ...mockAllowances[0],
      id: 4,
      host: "disabled.example",
      enabled: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("takes the amount out of the budget before paying", async () => {
    await sendPaymentOrPrompt(message(100_000), sender);

    expect(sendPayment).toHaveBeenCalled();
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

  test("takes the rounded-up amount out of the budget for a sub-satoshi amount", async () => {
    // 100.5 sats are rounded up to 101 so the budget is never under-debited
    await sendPaymentOrPrompt(message(100_500), sender);

    expect((await db.allowances.get(1))?.remainingBudget).toBe(399);
  });

  test("prompts for amountless invoices", async () => {
    await sendPaymentOrPrompt(message(), sender);

    expect(utils.openPrompt).toHaveBeenCalled();
    expect(sendPayment).not.toHaveBeenCalled();
  });

  test("prompts when the allowance is disabled", async () => {
    await sendPaymentOrPrompt(message(100_000), {
      origin: "https://disabled.example",
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
});
