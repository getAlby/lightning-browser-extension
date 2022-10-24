/**
 * Highly inspired by: https://github.com/AryanJ-NYC/bitcoin-conversion
 */
import type { CURRENCIES } from "../constants";

export const getFiatValue = ({
  amount,
  rate,
  currency,
}: {
  amount: number | string;
  rate: number;
  currency: CURRENCIES;
}) => {
  const fiatValue = Number(amount) * rate;

  return fiatValue.toLocaleString("en", {
    style: "currency",
    currency,
  });
};

export const getSatValue = (balance: number) =>
  `${balance} sat${balance != 1 ? "s" : ""}`;
