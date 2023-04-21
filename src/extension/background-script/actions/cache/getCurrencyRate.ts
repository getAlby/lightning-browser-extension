import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import browser from "webextension-polyfill";
import type { CURRENCIES } from "~/common/constants";
import { numSatsInBtc } from "~/common/utils/currencyConvert";
import state from "~/extension/background-script/state";
import type { MessageCurrencyRateGet } from "~/types";

dayjs.extend(isSameOrBefore);

interface CurrencyRate {
  currency?: CURRENCIES;
  rate?: number;
  timestamp?: number;
}

const storeCurrencyRate = async ({ rate, currency }: CurrencyRate) => {
  const currencyRate: CurrencyRate = {
    currency,
    rate,
    timestamp: Date.now(),
  };

  await browser.storage.local.set({
    currencyRate: JSON.stringify(currencyRate),
  });
};

const getFiatBtcRate = async (currency: CURRENCIES): Promise<number> => {
  const { settings } = state.getState();
  const { exchange } = settings;

  let response;

  if (exchange === "yadio") {
    response = await axios.get(
      `https://api.yadio.io/exrates/${currency.toLowerCase()}`,
      {
        adapter: fetchAdapter,
      }
    );
    const data = await response?.data;
    return data.BTC / numSatsInBtc;
  }

  if (exchange === "coindesk") {
    response = await axios.get(
      `https://api.coindesk.com/v1/bpi/currentprice/${currency.toLowerCase()}.json`,
      {
        adapter: fetchAdapter,
      }
    );
    const data = await response?.data;
    return data.bpi[currency].rate_float / numSatsInBtc;
  }

  response = await axios.get(
    `https://getalby.com/api/rates/${currency.toLowerCase()}.json`,
    {
      adapter: fetchAdapter,
    }
  );
  const data = await response?.data;

  return data[currency].rate_float / numSatsInBtc;
};

export const getCurrencyRateWithCache = async (currency: CURRENCIES) => {
  let currencyRateCache: CurrencyRate = {};
  const result = await browser.storage.local.get(["currencyRate"]);

  if (result.currencyRate) {
    currencyRateCache = JSON.parse(result.currencyRate);

    if (currencyRateCache.currency === currency) {
      const isRateNewEnough = dayjs().isSameOrBefore(
        dayjs(currencyRateCache?.timestamp).add(10, "minute")
      );

      if (isRateNewEnough && currencyRateCache.rate) {
        return currencyRateCache.rate;
      }

      const rate = await getFiatBtcRate(currency);
      await storeCurrencyRate({ rate, currency });
      return rate;
    }
  }

  const rate = await getFiatBtcRate(currency);
  await storeCurrencyRate({ currency, rate });
  return rate;
};

const getCurrencyRate = async (message: MessageCurrencyRateGet) => {
  const { currency } = state.getState().settings;
  const rate = await getCurrencyRateWithCache(currency);

  return {
    data: { rate },
  };
};

export default getCurrencyRate;
