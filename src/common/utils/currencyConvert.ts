/**
 * Highly inspired by: https://github.com/AryanJ-NYC/bitcoin-conversion
 */
import i18n from "~/i18n/i18nConfig";

import type { CURRENCIES } from "../constants";

export const getFiatValue = (params: {
  amount: number | string;
  rate: number;
  currency: CURRENCIES;
  locale: string;
}) => {
  const fiatValue = Number(params.amount) * params.rate;

  return new Intl.NumberFormat(params.locale, {
    style: "currency",
    currency: params.currency || "en",
  }).format(fiatValue);
};

export const getSatValue = (balance: number) =>
  `${balance} ${i18n.t("sats", { count: balance, ns: "common" })}`;
