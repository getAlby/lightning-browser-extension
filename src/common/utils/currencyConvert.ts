/**
 * Highly inspired by: https://github.com/AryanJ-NYC/bitcoin-conversion
 */
// import type { CURRENCIES } from "~/common/constants";

// import { getSettings, getCurrencyRate } from "~/common/lib/api";

// const getCurrencySettings = async () => {
//   const { currency, exchange } = await getSettings();

//   return {
//     currency,
//     exchange,
//   };
// };

const numSatsInBtc = 100_000_000;

const bitcoinToFiat = async (
  amountInBtc: number | string,
  // convertTo: CURRENCIES,
  rate: number
) => {
  // const { rate } = await getCurrencyRate({ currency: convertTo });
  return Number(amountInBtc) * Number(rate);
};

const satoshisToBitcoin = (amountInSatoshis: number | string) => {
  return Number(amountInSatoshis) / numSatsInBtc;
};

export const satoshisToFiat = async ({
  amountInSats,
  // convertTo,
  rate,
}: {
  amountInSats: number | string;
  // convertTo: CURRENCIES;
  rate: number;
}) => {
  const btc = satoshisToBitcoin(amountInSats);
  const fiat = await bitcoinToFiat(btc, rate);
  return fiat;
};

// export const getFiatValue = async (amount: number | string) => {
//   const { currency } = await getCurrencySettings();
//   const fiatValue = await satoshisToFiat({
//     amountInSats: amount,
//     convertTo: currency,
//   });
//   const localeFiatValue = fiatValue.toLocaleString("en", {
//     style: "currency",
//     currency: currency,
//   });

//   return localeFiatValue;
// };

export const getSatValue = (balance: number) => `${balance} sats`;
