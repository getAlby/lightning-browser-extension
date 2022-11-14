import { CURRENCIES } from "~/common/constants";

import { getFiatValue, getSatValue } from "../currencyConvert";

describe("Currency coversion utils", () => {
  describe("getFiatValue", () => {
    test("formats correctly for USD in english language", () => {
      const result = getFiatValue({
        amount: 123456789,
        rate: 0.00029991836,
        currency: CURRENCIES["USD"],
        locale: "en",
      });

      expect(result).toBe("$37,026.96");
    });

    test("formats correctly for USD in italian language", () => {
      const result = getFiatValue({
        amount: 123456789,
        rate: 0.00029991836,
        currency: CURRENCIES["USD"],
        locale: "it",
      });

      expect(result).toBe("37.026,96\xa0USD");
    });

    test("formats correctly for EUR in swedish language", () => {
      const result = getFiatValue({
        amount: 123456789,
        rate: 0.00029991836,
        currency: CURRENCIES["EUR"],
        locale: "sv",
      });

      expect(result).toBe("37\xa0026,96\xa0€"); // Intl.NumberFormat uses a non-breaking space
    });

    test("formats correctly for EUR in brazilian portugese language", () => {
      const result = getFiatValue({
        amount: 123456789,
        rate: 0.00029991836,
        currency: CURRENCIES["EUR"],
        locale: "pt-BR",
      });

      expect(result).toBe("€\xa037.026,96");
    });

    test("formats correctly for EUR in spanish language", () => {
      const result = getFiatValue({
        amount: 123456789,
        rate: 0.00029991836,
        currency: CURRENCIES["EUR"],
        locale: "es",
      });

      expect(result).toBe("37.026,96\xa0€");
    });

    test("formats correctly for USD in spanish language", () => {
      const result = getFiatValue({
        amount: 123456789,
        rate: 0.00029991836,
        currency: CURRENCIES["USD"],
        locale: "es",
      });

      expect(result).toBe("37.026,96\xa0US$");
    });
  });

  test("getSatValue", async () => {
    const result = getSatValue(123456789);

    expect(result).toBe("123456789 sats");
  });
});
