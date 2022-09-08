import { CURRENCIES } from "~/common/constants";
import type { MessageCurrencyRateGet } from "~/types";

import getCurrencyRate from "../getCurrencyRate";

jest.mock("~/extension/background-script/actions/settings", () => {
  return {
    get: jest.fn(() => ({ data: { exchange: "coindesk" } })),
  };
});

jest.useFakeTimers().setSystemTime(new Date(1577836800000)); // Wed Jan 01 2020 08:00:00

const message: MessageCurrencyRateGet = {
  application: "LBE",
  prompt: true,
  action: "getCurrencyRate",
  origin: {
    internal: true,
  },
  args: {
    currency: CURRENCIES["USD"],
  },
};

describe("currencyRate", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("storing rate for the first time", async () => {
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({});
    const result = await getCurrencyRate(message);
    expect(result.data.rate).toBe(29991.836);
  });

  test("storing rate if it is outdated", async () => {
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      currencyRate: JSON.stringify({
        timestamp: 1400000000000, // Wed May 14 2014 00:53:20 -> earlier than 2020 above
        rate: 666666,
      }),
    });
    const result = await getCurrencyRate(message);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      currencyRate: '{"rate":29991.836,"timestamp":1577836800000}',
    });
    expect(result.data.rate).toBe(29991.836);
  });

  test("returning rate if still valid", async () => {
    (chrome.storage.local.get as jest.Mock).mockResolvedValue({
      currencyRate: JSON.stringify({
        timestamp: 1577836810000, // Wed Jan 01 2020 08:00:10 -> still within a minute
        rate: 88888888,
      }),
    });
    const result = await getCurrencyRate(message);
    expect(chrome.storage.local.set).not.toHaveBeenCalled();
    expect(result.data.rate).toBe(88888888);
  });
});
