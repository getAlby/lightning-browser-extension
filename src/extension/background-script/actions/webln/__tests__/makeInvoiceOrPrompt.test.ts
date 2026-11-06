import utils from "~/common/lib/utils";
import type { Message } from "~/types";

import makeInvoiceOrPrompt from "../makeInvoiceOrPrompt";

jest.mock("~/common/lib/utils", () => ({
  __esModule: true,
  default: { openPrompt: jest.fn(() => Promise.resolve({ data: {} })) },
}));

function message(args: Record<string, unknown>): Message {
  return {
    application: "LBE",
    prompt: true,
    action: "makeInvoice",
    origin: { internal: true },
    args,
  };
}

describe("makeInvoiceOrPrompt", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test.each(["1000", 1000])(
    "prompts with a fixed amount of %p sats",
    async (amount) => {
      await makeInvoiceOrPrompt(message({ amount, memo: "test" }));

      expect(utils.openPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.objectContaining({
            amountEditable: false,
            invoiceAttributes: expect.objectContaining({ amount: 1000 }),
          }),
        })
      );
    }
  );

  test("prompts with an editable amount when none is given", async () => {
    await makeInvoiceOrPrompt(message({ defaultAmount: "1000" }));

    expect(utils.openPrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.objectContaining({ amountEditable: true }),
      })
    );
  });

  test.each(["1,000,000", "1e6", "1.5", " 10", "0", -1, 1.5, ["1", "000000"]])(
    "rejects the fixed amount %p without prompting",
    async (amount) => {
      const result = await makeInvoiceOrPrompt(message({ amount }));

      expect(result).toStrictEqual({ error: "Invalid amount." });
      expect(utils.openPrompt).not.toHaveBeenCalled();
    }
  );
});
