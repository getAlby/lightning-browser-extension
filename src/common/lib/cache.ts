import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import browser from "webextension-polyfill";
import { CURRENCIES } from "~/common/constants";
import { getFiatBtcRate } from "~/common/utils/currencyConvert";
import type { AccountInfo } from "~/types";

dayjs.extend(isSameOrBefore);

export const getAccountsCache = async () => {
  let accountsCache: { [id: string]: AccountInfo } = {};
  const result = await browser.storage.local.get(["accounts"]);
  if (result.accounts) {
    accountsCache = JSON.parse(result.accounts);
  }
  return accountsCache;
};

export const storeAccounts = (accounts: { [id: string]: AccountInfo }) => {
  browser.storage.local.set({
    accounts: JSON.stringify(accounts),
  });
};

export const removeAccountFromCache = async (id: string) => {
  const accountsCache = await getAccountsCache();
  if (accountsCache[id]) {
    delete accountsCache[id];
    storeAccounts(accountsCache);
  }
  return accountsCache;
};

export const getCurrencyRateFromCache = async (currency: CURRENCIES) => {
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
      storeCurrencyRate(rate);
      return rate;
    }
  }

  const rate = await getFiatBtcRate(currency);
  storeCurrencyRate(rate);
  return rate;
};

const storeCurrencyRate = (rate: number) => {
  const currencyRate = {
    rate,
    timestamp: Date.now(),
  };

  browser.storage.local.set({
    currencyRate: JSON.stringify(currencyRate),
  });
};
