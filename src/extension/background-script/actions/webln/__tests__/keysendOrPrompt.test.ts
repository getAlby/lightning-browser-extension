import utils from "~/common/lib/utils";
import db from "~/extension/background-script/db";
import { allowanceFixture } from "~/fixtures/allowances";
import type { Message, Sender } from "~/types";

import keysend from "../../ln/keysend";
import keysendOrPrompt from "../keysendOrPrompt";

jest.mock("~/common/lib/utils", () => ({
  __esModule: true,
  default: { openPrompt: jest.fn(() => Promise.resolve({ data: {} })) },
}));

jest.mock("../../ln/keysend", () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({ data: {} })),
}));

// the allowance fixture for getalby.com has a remaining budget of 500 sats
const sender: Sender = { origin: "https://getalby.com" };

function message(amount: unknown): Message {
  return {
    application: "LBE",
    prompt: true,
    action: "keysendOrPrompt",
    origin: { internal: true },
    args: {
      destination:
        "030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3",
      amount,
    },
  };
}

describe("keysendOrPrompt", () => {
  beforeEach(async () => {
    await db.allowances.clear();
    await db.allowances.bulkAdd(allowanceFixture);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("pays without a prompt when the amount is within the budget", async () => {
    await keysendOrPrompt(message("100"), sender);

    expect(keysend).toHaveBeenCalled();
    expect(utils.openPrompt).not.toHaveBeenCalled();
    expect((await db.allowances.get(1))?.remainingBudget).toBe(400);
  });

  test("prompts when the amount exceeds the budget", async () => {
    await keysendOrPrompt(message(1000), sender);

    expect(keysend).not.toHaveBeenCalled();
    expect(utils.openPrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "confirmKeysend",
        args: expect.objectContaining({ amount: 1000 }),
      })
    );
  });

  test.each(["100000e-5", "1e3", "1.5", " 10", "", "0", -1, 1.5])(
    "rejects the amount %p without paying or prompting",
    async (amount) => {
      const result = await keysendOrPrompt(message(amount), sender);

      expect(result).toStrictEqual({ error: "Invalid amount." });
      expect(keysend).not.toHaveBeenCalled();
      expect(utils.openPrompt).not.toHaveBeenCalled();
      expect((await db.allowances.get(1))?.remainingBudget).toBe(500);
    }
  );
});
