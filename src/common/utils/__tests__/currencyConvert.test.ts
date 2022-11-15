import { CURRENCIES } from "~/common/constants";

import {
  getFormattedFiat,
  getFormattedNumber,
  getFormattedSats,
} from "../currencyConvert";

describe("Currency coversion utils", () => {
  describe("getFormattedFiat", () => {
    test("formats correctly for USD in english language", () => {
      const result = getFormattedFiat({
        amount: 123456789,
        rate: 0.00029991836,
        currency: CURRENCIES["USD"],
        locale: "en",
      });

      expect(result).toBe("$37,026.96");
    });

    test("formats correctly for USD in italian language", () => {
      const result = getFormattedFiat({
        amount: 123456789,
        rate: 0.00029991836,
        currency: CURRENCIES["USD"],
        locale: "it",
      });

      expect(result).toBe("37.026,96\xa0USD");
    });

    test("formats correctly for EUR in swedish language", () => {
      const result = getFormattedFiat({
        amount: 123456789,
        rate: 0.00029991836,
        currency: CURRENCIES["EUR"],
        locale: "sv",
      });

      expect(result).toBe("37\xa0026,96\xa0€"); // Intl.NumberFormat uses a non-breaking space
    });

    test("formats correctly for EUR in brazilian portugese language", () => {
      const result = getFormattedFiat({
        amount: 123456789,
        rate: 0.00029991836,
        currency: CURRENCIES["EUR"],
        locale: "pt-BR",
      });

      expect(result).toBe("€\xa037.026,96");
    });

    test("formats correctly for EUR in spanish language", () => {
      const result = getFormattedFiat({
        amount: 123456789,
        rate: 0.00029991836,
        currency: CURRENCIES["EUR"],
        locale: "es",
      });

      expect(result).toBe("37.026,96\xa0€");
    });

    test("formats correctly for USD in spanish language", () => {
      const result = getFormattedFiat({
        amount: 123456789,
        rate: 0.00029991836,
        currency: CURRENCIES["USD"],
        locale: "es",
      });

      expect(result).toBe("37.026,96\xa0US$");
    });

    test("falls back to english", () => {
      const result = getFormattedFiat({
        amount: 123456789,
        rate: 0.00029991836,
        currency: CURRENCIES["USD"],
        locale: "",
      });

      expect(result).toBe("$37,026.96");
    });
  });

  describe("getFormattedNumber", () => {
    test("formats correctly for english", async () => {
      const result = getFormattedNumber({ amount: 9999999, locale: "en" });

      expect(result).toBe("9,999,999");
    });

    test("formats correctly for spanish", async () => {
      const result = getFormattedNumber({ amount: 9999999, locale: "es" });

      expect(result).toBe("9.999.999");
    });

    test("falls back to english", async () => {
      const result = getFormattedNumber({ amount: 9999999, locale: "" });

      expect(result).toBe("9,999,999");
    });
  });

  describe("getFormattedSats", () => {
    test("formats correctly for english", async () => {
      const result = getFormattedSats({ amount: 123456789, locale: "en" });

      expect(result).toBe("123,456,789 sats");
    });

    test("formats correctly for spanish", async () => {
      const result = getFormattedSats({ amount: 123456789, locale: "es" });

      expect(result).toBe("123.456.789 sats");
    });

    test("falls back to english", async () => {
      const result = getFormattedSats({ amount: 123456789, locale: "" });

      expect(result).toBe("123,456,789 sats");
    });
  });
});
