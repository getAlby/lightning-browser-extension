/**
 * Highly inspired by: https://github.com/AryanJ-NYC/bitcoin-conversion
 */
import type { CURRENCIES } from "../constants";

const satsToFiat = async (amount: number | string, rate: number) => {
  return Number(amount) * rate;
};

const satoshisToFiat = async ({
  amountInSats,
  rate,
}: {
  amountInSats: number | string;
  rate: number;
}) => {
  const fiat = await satsToFiat(amountInSats, rate);
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
