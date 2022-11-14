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

export const getFormattedNumber = (params: {
  amount: number | string;
  locale: string;
}) => {
  return new Intl.NumberFormat(params.locale || "en").format(
    Number(params.amount)
  );
};

export const getSatValue = (params: {
  amount: number | string;
  locale: string;
}) => {
  const formattedNumber = getFormattedNumber(params);

  return `${formattedNumber} ${i18n.t("sats", {
    count: Number(params.amount),
    ns: "common",
  })}`;
};
