import { getFiatValue, getSatValue } from "../currencyConvert";

jest.mock("~/common/lib/api", () => {
  return {
    getSettings: jest.fn(() => ({
      currency: "USD",
      exchange: "coindesk",
    })),
    getCurrencyRate: jest.fn(() => ({ rate: 29991.836 })),
  };
});

describe("Currency coversion utils", () => {
  test("getFiatValue", async () => {
    const result = await getFiatValue(123456789);

    expect(result).toBe("$37,026.96");
  });

  test("getSatValue", async () => {
    const result = getSatValue(123456789);

    expect(result).toBe("123456789 sats");
  });
});
