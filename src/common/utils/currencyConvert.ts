/**
 * Highly inspired by: https://github.com/AryanJ-NYC/bitcoin-conversion
 */
// import axios from "axios";
import { CURRENCIES } from "~/common/constants";
import { getSettings, getCurrencyRate } from "~/common/lib/api";

const getCurrencySettings = async () => {
  const { currency, exchange } = await getSettings();

  return {
    currency,
    exchange,
  };
};

const numSatsInBtc = 100_000_000;

// export const getFiatBtcRate = async (currency: CURRENCIES): Promise<number> => {
//   const { exchange } = await getCurrencySettings();

//   let response;

//   if (exchange === "yadio") {
//     response = await axios.get(
//       `https://api.yadio.io/exrates/${currency.toLowerCase()}`
//     );
//     const data = await response?.data;
//     return data.BTC;
//   }

//   if (exchange === "coindesk") {
//     response = await axios.get(
//       `https://api.coindesk.com/v1/bpi/currentprice/${currency.toLowerCase()}.json`
//     );
//     const data = await response?.data;
//     return data.bpi[currency].rate_float;
//   }

//   response = await axios.get(
//     `https://getalby.com/api/rates/${currency.toLowerCase()}.json`
//   );
//   const data = await response?.data;
//   return data[currency].rate_float;
// };

const bitcoinToFiat = async (
  amountInBtc: number | string,
  convertTo: CURRENCIES
) => {
  const { rate } = await getCurrencyRate({ currency: convertTo });
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
  convertTo: CURRENCIES;
}) => {
  const btc = satoshisToBitcoin(amountInSats);
  const fiat = await bitcoinToFiat(btc, convertTo);
  return fiat;
};

export const getFiatValue = async (amount: number | string) => {
  const { currency } = await getCurrencySettings();
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

export const getSatValue = (balance: number) => `${balance} sats`;
