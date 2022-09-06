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
