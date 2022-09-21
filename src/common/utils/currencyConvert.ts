/**
 * Highly inspired by: https://github.com/AryanJ-NYC/bitcoin-conversion
 */
import type { CURRENCIES } from "../constants";

const numSatsInBtc = 100_000_000;

const bitcoinToFiat = async (amountInBtc: number | string, rate: number) => {
  return Number(amountInBtc) * Number(rate);
};

const satoshisToBitcoin = (amountInSatoshis: number | string) => {
  return Number(amountInSatoshis) / numSatsInBtc;
};

const satoshisToFiat = async ({
  amountInSats,
  rate,
}: {
  amountInSats: number | string;
  rate: number;
}) => {
  const btc = satoshisToBitcoin(amountInSats);
  const fiat = await bitcoinToFiat(btc, rate);
  return fiat;
};

export const getFiatValue = async ({
  amount,
  rate,
  currency,
}: {
  amount: number | string;
  rate: number;
  currency: CURRENCIES;
}) => {
  const fiatValue = await satoshisToFiat({
    amountInSats: amount,
    rate,
  });

  return fiatValue.toLocaleString("en", {
    style: "currency",
    currency,
  });
};

export const getSatValue = (balance: number) => `${balance} sats`;
