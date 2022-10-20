import { CURRENCIES } from "~/common/constants";

import { getFiatValue, getSatValue } from "../currencyConvert";

describe("Currency coversion utils", () => {
  test("getFiatValue", () => {
    const result = getFiatValue({
      amount: 123456789,
      rate: 0.00029991836,
      currency: CURRENCIES["USD"],
    });

    expect(result).toBe("$37,026.96");
  });

  test("getSatValue", async () => {
    const result = getSatValue(123456789);

    expect(result).toBe("123456789 sats");
  });
});
