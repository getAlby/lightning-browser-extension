"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("~/common/constants");
const currencyConvert_1 = require("../currencyConvert");
describe("Currency coversion utils", () => {
    describe("getFormattedFiat", () => {
        test("formats correctly for USD in english language", () => {
            const result = (0, currencyConvert_1.getFormattedFiat)({
                amount: 123456789,
                rate: 0.00029991836,
                currency: constants_1.CURRENCIES["USD"],
                locale: "en",
            });
            expect(result).toBe("$37,026.96");
        });
        test("formats correctly for USD in italian language", () => {
            const result = (0, currencyConvert_1.getFormattedFiat)({
                amount: 123456789,
                rate: 0.00029991836,
                currency: constants_1.CURRENCIES["USD"],
                locale: "it",
            });
            expect(result).toBe("37.026,96\xa0USD");
        });
        test("formats correctly for EUR in swedish language", () => {
            const result = (0, currencyConvert_1.getFormattedFiat)({
                amount: 123456789,
                rate: 0.00029991836,
                currency: constants_1.CURRENCIES["EUR"],
                locale: "sv",
            });
            expect(result).toBe("37\xa0026,96\xa0€"); // Intl.NumberFormat uses a non-breaking space
        });
        test("formats correctly for EUR in brazilian portugese language", () => {
            const result = (0, currencyConvert_1.getFormattedFiat)({
                amount: 123456789,
                rate: 0.00029991836,
                currency: constants_1.CURRENCIES["EUR"],
                locale: "pt-BR",
            });
            expect(result).toBe("€\xa037.026,96");
        });
        test("formats correctly for EUR in spanish language", () => {
            const result = (0, currencyConvert_1.getFormattedFiat)({
                amount: 123456789,
                rate: 0.00029991836,
                currency: constants_1.CURRENCIES["EUR"],
                locale: "es",
            });
            expect(result).toBe("37.026,96\xa0€");
        });
        test("formats correctly for USD in spanish language", () => {
            const result = (0, currencyConvert_1.getFormattedFiat)({
                amount: 123456789,
                rate: 0.00029991836,
                currency: constants_1.CURRENCIES["USD"],
                locale: "es",
            });
            expect(result).toBe("37.026,96\xa0US$");
        });
        test("falls back to english", () => {
            const result = (0, currencyConvert_1.getFormattedFiat)({
                amount: 123456789,
                rate: 0.00029991836,
                currency: constants_1.CURRENCIES["USD"],
                locale: "",
            });
            expect(result).toBe("$37,026.96");
        });
    });
    describe("getFormattedNumber", () => {
        test("formats correctly for english", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = (0, currencyConvert_1.getFormattedNumber)({ amount: 9999999, locale: "en" });
            expect(result).toBe("9,999,999");
        }));
        test("formats correctly for spanish", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = (0, currencyConvert_1.getFormattedNumber)({ amount: 9999999, locale: "es" });
            expect(result).toBe("9.999.999");
        }));
        test("falls back to english", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = (0, currencyConvert_1.getFormattedNumber)({ amount: 9999999, locale: "" });
            expect(result).toBe("9,999,999");
        }));
    });
    describe("getFormattedSats", () => {
        test("formats correctly for english", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = (0, currencyConvert_1.getFormattedSats)({ amount: 123456789, locale: "en" });
            expect(result).toBe("123,456,789 sats");
        }));
        test("formats correctly for spanish", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = (0, currencyConvert_1.getFormattedSats)({ amount: 123456789, locale: "es" });
            expect(result).toBe("123.456.789 sats");
        }));
        test("falls back to english", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = (0, currencyConvert_1.getFormattedSats)({ amount: 123456789, locale: "" });
            expect(result).toBe("123,456,789 sats");
        }));
    });
});
