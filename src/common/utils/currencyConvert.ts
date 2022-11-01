/**
 * Highly inspired by: https://github.com/AryanJ-NYC/bitcoin-conversion
 */
import i18n from "~/i18n/i18nConfig";

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
  `${balance} ${i18n.t("sats", { count: balance, ns: "common" })}`;
