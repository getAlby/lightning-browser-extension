import { CURRENCIES } from "~/common/constants";
import state from "~/extension/background-script/state";
import type { MessageCurrencyRateGet } from "~/types";

import getCurrencyRate from "../getCurrencyRate";

const mockState = {
  settings: { exchange: "coindesk", currency: CURRENCIES["USD"] },
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock("@vespaiach/axios-fetch-adapter", () => {});

state.getState = jest.fn().mockReturnValue(mockState);

jest.useFakeTimers().setSystemTime(new Date(1577836800000)); // Wed Jan 01 2020 08:00:00

const message: MessageCurrencyRateGet = {
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

  test("storing rate for the first time", async () => {
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({});
    const result = await getCurrencyRate(message);
    expect(result.data.rate).toBe(0.00029991836);
  });

  test("storing rate if it is outdated", async () => {
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      currencyRate: JSON.stringify({
        currency: CURRENCIES["USD"],
        rate: 666666,
        timestamp: 1400000000000, // Wed May 14 2014 00:53:20 -> earlier than 2020 above
      }),
    });
    const result = await getCurrencyRate(message);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      currencyRate:
        '{"currency":"USD","rate":0.00029991836,"timestamp":1577836800000}',
    });
    expect(result.data.rate).toBe(0.00029991836);
  });

  test("returning rate if still valid", async () => {
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      currencyRate: JSON.stringify({
        currency: CURRENCIES["USD"],
        rate: 88888888,
        timestamp: 1577836810000, // Wed Jan 01 2020 08:00:10 -> still within a minute
      }),
    });
    const result = await getCurrencyRate(message);
    expect(chrome.storage.local.set).not.toHaveBeenCalled();
    expect(result.data.rate).toBe(88888888);
  });

  test("storing rate if cached currency is outdated", async () => {
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      currencyRate: JSON.stringify({
        currency: CURRENCIES["EUR"],
        rate: 88888888,
        timestamp: 1577836810000, // Wed Jan 01 2020 08:00:10 -> still within a minute
      }),
    });
    await getCurrencyRate(message);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      currencyRate:
        '{"currency":"USD","rate":0.00029991836,"timestamp":1577836800000}',
    });
  });
});
