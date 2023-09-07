import dayjs from "dayjs";
import i18n from "i18next";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import toast from "~/app/components/Toast";
import { setTheme } from "~/app/utils";
import { ACCOUNT_CURRENCIES, CURRENCIES } from "~/common/constants";
import api from "~/common/lib/api";
import { DEFAULT_SETTINGS } from "~/common/settings";
import {
  getFormattedCurrency as getFormattedCurrencyUtil,
  getFormattedFiat as getFormattedFiatUtil,
  getFormattedNumber as getFormattedNumberUtil,
  getFormattedSats as getFormattedSatsUtil,
} from "~/common/utils/currencyConvert";
import type { SettingsStorage } from "~/types";

interface SettingsContextType {
  settings: SettingsStorage;
  updateSetting: (setting: Setting) => void;
  isLoading: boolean;
  getFormattedFiat: (amount: number | string) => Promise<string>;
  getFormattedSats: (amount: number | string) => string;
  getFormattedNumber: (amount: number | string) => string;
  getFormattedInCurrency: (
    amount: number | string,
    currency?: ACCOUNT_CURRENCIES
  ) => string;
}

type Setting = Partial<SettingsStorage>;

const SettingsContext = createContext({} as SettingsContextType);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [settings, setSettings] =
    useState<SettingsContextType["settings"]>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // store latest currency and currency rate in ref to prevent a re-render
  const currencyRate = useRef<null | { rate: number; currency: CURRENCIES }>(
    null
  );

  // call this to trigger a re-render on all occassions
  const updateSetting = async (setting: Setting) => {
    setSettings((prevState) => ({
      ...prevState,
      ...setting,
    }));
    await api.setSetting(setting); // updates browser storage as well
  };

  // Invoked only on on mount.
  useEffect(() => {
    api
      .getSettings()
      .then((settings) => {
        setSettings(settings);
      })
      .catch((e) => {
        toast.error(`An unexpected error occurred (${e.message})`);
        console.error(
          `SettingsProvider: An unexpected error occurred (${e.message})`
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const getCurrencyRate = async (): Promise<number> => {
    // ensure to get the correct rate for current currency in state
    if (settings.currency !== currencyRate.current?.currency) {
      const response = await api.getCurrencyRate(); // gets rate from browser.storage or API

      // update local ref
      currencyRate.current = {
        rate: response.rate,
        currency: settings.currency,
      };
    }

    return currencyRate.current.rate;
  };

  const getFormattedFiat = async (amount: number | string) => {
    try {
      const rate = await getCurrencyRate();
      const value = getFormattedFiatUtil({
        amount,
        rate,
        currency: settings.currency,
        locale: settings.locale,
      });

      return value;
    } catch (e) {
      console.error(e);

      return "??"; // show the user that something went wrong
    }
  };

  const getFormattedSats = (amount: number | string) => {
    return getFormattedSatsUtil({ amount, locale: settings.locale });
  };

  const getFormattedNumber = (amount: number | string) => {
    return getFormattedNumberUtil({ amount, locale: settings.locale });
  };

  const getFormattedInCurrency = (
    amount: number | string,
    currency = "BTC" as ACCOUNT_CURRENCIES
  ) => {
    if (currency === "BTC") {
      return getFormattedSats(amount);
    }

    return getFormattedCurrencyUtil({
      amount,
      locale: settings.locale,
      currency,
    });
  };

  // update locale on every change
  useEffect(() => {
    i18n.changeLanguage(settings.locale);

    // need to switch i.e. `pt_BR` to `pt-br`
    const daysjsLocaleFormatted = settings.locale
      .toLowerCase()
      .replace("_", "-");
    dayjs.locale(daysjsLocaleFormatted);
  }, [settings.locale]);

  // update theme on every change
  useEffect(() => {
    setTheme(); // Get the active theme and apply corresponding Tailwind classes to the document
  }, [settings.theme]);

  const value = {
    getFormattedFiat,
    getFormattedSats,
    getFormattedNumber,
    getFormattedInCurrency,
    settings,
    updateSetting,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
