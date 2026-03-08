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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("~/common/constants");
const state_1 = __importDefault(require("~/extension/background-script/state"));
const getCurrencyRate_1 = __importDefault(require("../getCurrencyRate"));
const mockState = {
    settings: { exchange: "coindesk", currency: constants_1.CURRENCIES["USD"] },
};
state_1.default.getState = jest.fn().mockReturnValue(mockState);
jest.useFakeTimers().setSystemTime(new Date(1577836800000)); // Wed Jan 01 2020 08:00:00
const message = {
    application: "LBE",
    prompt: true,
    action: "getCurrencyRate",
    origin: {
        internal: true,
    },
};
describe("currencyRate", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("storing rate for the first time", () => __awaiter(void 0, void 0, void 0, function* () {
        chrome.storage.local.get.mockResolvedValue({});
        const result = yield (0, getCurrencyRate_1.default)(message);
        expect(result.data.rate).toBe(0.00029991836);
    }));
    test("storing rate if it is outdated", () => __awaiter(void 0, void 0, void 0, function* () {
        chrome.storage.local.get.mockResolvedValue({
            currencyRate: JSON.stringify({
                currency: constants_1.CURRENCIES["USD"],
                rate: 666666,
                timestamp: 1400000000000, // Wed May 14 2014 00:53:20 -> earlier than 2020 above
            }),
        });
        const result = yield (0, getCurrencyRate_1.default)(message);
        expect(chrome.storage.local.set).toHaveBeenCalledWith({
            currencyRate: '{"currency":"USD","rate":0.00029991836,"timestamp":1577836800000}',
        });
        expect(result.data.rate).toBe(0.00029991836);
    }));
    test("returning rate if still valid", () => __awaiter(void 0, void 0, void 0, function* () {
        chrome.storage.local.get.mockResolvedValue({
            currencyRate: JSON.stringify({
                currency: constants_1.CURRENCIES["USD"],
                rate: 88888888,
                timestamp: 1577836810000, // Wed Jan 01 2020 08:00:10 -> still within a minute
            }),
        });
        const result = yield (0, getCurrencyRate_1.default)(message);
        expect(chrome.storage.local.set).not.toHaveBeenCalled();
        expect(result.data.rate).toBe(88888888);
    }));
    test("storing rate if cached currency is outdated", () => __awaiter(void 0, void 0, void 0, function* () {
        chrome.storage.local.get.mockResolvedValue({
            currencyRate: JSON.stringify({
                currency: constants_1.CURRENCIES["EUR"],
                rate: 88888888,
                timestamp: 1577836810000, // Wed Jan 01 2020 08:00:10 -> still within a minute
            }),
        });
        yield (0, getCurrencyRate_1.default)(message);
        expect(chrome.storage.local.set).toHaveBeenCalledWith({
            currencyRate: '{"currency":"USD","rate":0.00029991836,"timestamp":1577836800000}',
        });
    }));
});
