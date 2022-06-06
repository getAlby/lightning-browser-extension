import axios from "axios";
import currencyJs from "currency.js";
import {
  getSettings,
  /*, setSetting */
} from "~/common/lib/api";
import {
  SupportedCurrencies,
  /* , SupportedExchanges */
} from "~/types";

const settings = async () => {
  const { currency, exchange } = await getSettings();

  return {
    currency,
    exchange,
  };
};

// export const saveCurrencySetting = (currency: SupportedCurrencies) => {
//   console.log("CIURRENSEY SETTT");

//   setSetting({
//     currency,
//   });
// };

const numSatsInBtc = 100_000_000;

export const getBalances = async (balance: number) => {
  const { currency } = await settings();
  const fiatValue = await satoshisToFiat({
    amountInSats: balance,
    convertTo: currency,
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

const getFiatBtcRate = async (
  currency: SupportedCurrencies
): Promise<string> => {
  const { exchange } = await settings();

  let response;

  // FYI: YAD.IO is i.e. not supporting "ISK", maybe more?
  if (exchange === "Yad.io") {
    response = await axios.get(
      `https://api.yadio.io/exrates/${currency.toLowerCase()}`
    );
    const data = await response?.data;
    return currencyJs(data.BTC, {
      separator: "",
      symbol: "",
    }).format();
  }

  response = await axios.get(
    `https://api.coindesk.com/v1/bpi/currentprice/${currency.toLowerCase()}.json`
  );

  const data = await response?.data;

  return currencyJs(data.bpi[currency].rate, {
    separator: "",
    symbol: "",
  }).format();
};

const bitcoinToFiat = async (
  amountInBtc: number | string,
  convertTo: SupportedCurrencies
) => {
  const rate = await getFiatBtcRate(convertTo);
  return Number(amountInBtc) * Number(rate);
};

const satoshisToBitcoin = (amountInSatoshis: number | string) => {
  return Number(amountInSatoshis) / numSatsInBtc;
};

const satoshisToFiat = async ({
  amountInSats,
  convertTo,
}: {
  amountInSats: number | string;
  convertTo: SupportedCurrencies;
}) => {
  const btc = satoshisToBitcoin(amountInSats);
  const fiat = await bitcoinToFiat(btc, convertTo);
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
