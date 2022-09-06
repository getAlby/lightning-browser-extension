import axios from "axios";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import browser from "webextension-polyfill";
import { CURRENCIES } from "~/common/constants";
import { get as getSettings } from "~/extension/background-script/actions/settings";

dayjs.extend(isSameOrBefore);

const storeCurrencyRate = async (rate: number) => {
  const currencyRate = {
    rate,
    timestamp: Date.now(),
  };

  await browser.storage.local.set({
    currencyRate: JSON.stringify(currencyRate),
  });
};

const getFiatBtcRate = async (currency: CURRENCIES): Promise<number> => {
  const result = await getSettings();
  const { exchange } = result.data;

  let response;

  if (exchange === "yadio") {
    response = await axios.get(
      `https://api.yadio.io/exrates/${currency.toLowerCase()}`
    );
    const data = await response?.data;
    return data.BTC;
  }

  if (exchange === "coindesk") {
    response = await axios.get(
      `https://api.coindesk.com/v1/bpi/currentprice/${currency.toLowerCase()}.json`
    );
    const data = await response?.data;
    return data.bpi[currency].rate_float;
  }

  response = await axios.get(
    `https://getalby.com/api/rates/${currency.toLowerCase()}.json`
  );
  const data = await response?.data;
  return data[currency].rate_float;
};

const getCurrencyRateFromCache = async (currency: CURRENCIES) => {
  let currencyRateCache: { rate?: number; timestamp?: number } = {};
  const result = await browser.storage.local.get(["currencyRate"]);

  if (result?.currencyRate) {
    currencyRateCache = JSON.parse(result.currencyRate);

    const currentTime = dayjs();
    const rateTimestamp = dayjs(currencyRateCache?.timestamp);
    const rateTimestampPlusOneMinute = dayjs(rateTimestamp).add(1, "minute");
    const isRateCurrent = currentTime.isSameOrBefore(
      rateTimestampPlusOneMinute
    );

    if (isRateCurrent) {
      return currencyRateCache.rate;
    } else {
      const rate = await getFiatBtcRate(currency);
      await storeCurrencyRate(rate);
      return rate;
    }
  }

  const rate = await getFiatBtcRate(currency);
  await storeCurrencyRate(rate);
  return rate;
};

const getCurrencyRate = async (message: FixMe) => {
  const { currency } = message.args;
  const rate = await getCurrencyRateFromCache(currency);

  return {
    data: { rate },
  };
};

export default getCurrencyRate;
