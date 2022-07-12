/**
 * Highly inspired by: https://github.com/AryanJ-NYC/bitcoin-conversion
 */
import axios from "axios";
import debounce from "lodash/debounce";
import { CURRENCIES } from "~/common/constants";
import { getSettings } from "~/common/lib/api";

const settings = async () => {
  const { currency, exchange } = await getSettings();

  return {
    currency,
    exchange,
  };
};

const numSatsInBtc = 100_000_000;

const getFiatBtcRate = async (currency: CURRENCIES): Promise<string> => {
  const { exchange } = await settings();

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

// @TODO: https://github.com/getAlby/lightning-browser-extension/issues/1021
// Replace decounce by saving rate to app-cache and only get it every minute for the whole app
//
// https://github.com/lodash/lodash/issues/4400#issuecomment-834800398
const debouncedGetFiatBtcRate = debounce(
  async function (callback) {
    return await callback();
  },
  60000,
  {
    leading: true,
    trailing: false,
  }
);

const bitcoinToFiat = async (
  amountInBtc: number | string,
  convertTo: CURRENCIES,
  isLatestRate?: boolean
) => {
  const rate = isLatestRate
    ? await getFiatBtcRate(convertTo)
    : await debouncedGetFiatBtcRate(() => getFiatBtcRate(convertTo));

  return Number(amountInBtc) * Number(rate);
};

const satoshisToBitcoin = (amountInSatoshis: number | string) => {
  return Number(amountInSatoshis) / numSatsInBtc;
};

const satoshisToFiat = async ({
  amountInSats,
  convertTo,
  isLatestRate,
}: {
  amountInSats: number | string;
  convertTo: CURRENCIES;
  isLatestRate?: boolean;
}) => {
  const btc = satoshisToBitcoin(amountInSats);
  const fiat = await bitcoinToFiat(btc, convertTo, isLatestRate);
  return fiat;
};

export const getFiatValue = async (amount: number | string) => {
  const { currency } = await settings();
  const fiatValue = await satoshisToFiat({
    amountInSats: amount,
    convertTo: currency,
  });
  const localeFiatValue = fiatValue.toLocaleString("en", {
    style: "currency",
    currency: currency,
  });

  return localeFiatValue;
};

export const getBalances = async (balance: number, isLatestRate?: boolean) => {
  const { currency } = await settings();
  const fiatValue = await satoshisToFiat({
    amountInSats: balance,
    convertTo: currency,
    isLatestRate,
  });
  const localeFiatValue = fiatValue.toLocaleString("en", {
    style: "currency",
    currency: currency,
  });

  return {
    satsBalance: `${balance} sats`,
    fiatBalance: localeFiatValue,
  };
};
