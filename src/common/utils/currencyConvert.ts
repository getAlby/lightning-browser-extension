/**
 * Highly inspired by: https://github.com/AryanJ-NYC/bitcoin-conversion
 */
import i18n from "~/i18n/i18nConfig";

import type { CURRENCIES, ACCOUNT_CURRENCIES } from "../constants";

export const getFormattedCurrency = (params: {
  amount: number | string;
  currency: CURRENCIES | ACCOUNT_CURRENCIES;
  locale: string;
}) => {
  return new Intl.NumberFormat(params.locale || "en", {
    style: "currency",
    currency: params.currency,
  }).format(Number(params.amount));
};

export const getFormattedFiat = (params: {
  amount: number | string;
  rate: number;
  currency: CURRENCIES;
  locale: string;
}) => {
  const fiatValue = Number(params.amount) * params.rate;

  return getFormattedCurrency({ ...params, amount: fiatValue });
};

export const getFormattedNumber = (params: {
  amount: number | string;
  locale: string;
}) => {
  return new Intl.NumberFormat(params.locale || "en").format(
    Number(params.amount)
  );
};

export const getFormattedSats = (params: {
  amount: number | string;
  locale: string;
}) => {
  const formattedNumber = getFormattedNumber(params);

  return `${formattedNumber} ${i18n.t("common:sats", {
    count: Number(params.amount),
  })}`;
};
