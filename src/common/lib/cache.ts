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
  console.log("getCurrencyRateFromCache");

  let currencyRateCache: { rate?: ""; timestamp?: number } = {};
  const result = await browser.storage.local.get(["currencyRate"]);
  if (result.currencyRate) {
    console.log("GOT RATE");

    currencyRateCache = JSON.parse(result.currencyRate);

    const currentTime = dayjs();
    const rateTimestamp = dayjs(currencyRateCache?.timestamp);
    const rateTimestampPlusOneMinute = dayjs(rateTimestamp).add(1, "minute");

    // console.log(dayjs(currencyRateCache?.timestamp));

    console.log(currentTime.isSameOrBefore(rateTimestampPlusOneMinute));
    // console.log(currentTime.isSameOrAfter(rateTimestampPlusOneMinute));

    const isRateCurrent = currentTime.isSameOrBefore(
      rateTimestampPlusOneMinute
    );

    if (isRateCurrent) {
      console.log("IS NEW EOUGH");

      return currencyRateCache?.timestamp;
    } else {
      console.log("GET NEW RATE");
      const rate = await getFiatBtcRate(currency);
      storeCurrencyRate(rate);
      return rate;
    }
  } else {
    console.log("GET RATE FOR FIRST TIME");
    const rate = await getFiatBtcRate(currency);
    storeCurrencyRate(rate);
    return rate;
  }
};

const storeCurrencyRate = (rate: string) => {
  console.log("storeCurrencyRate");

  const currencyRate = {
    rate,
    timestamp: Date.now(),
  };

  browser.storage.local.set({
    currencyRate: JSON.stringify(currencyRate),
  });
};
