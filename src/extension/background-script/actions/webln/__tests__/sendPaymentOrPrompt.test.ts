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
  beforeAll(async () => {
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
