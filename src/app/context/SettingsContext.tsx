import dayjs from "dayjs";
import i18n from "i18next";
import { useState, useEffect, createContext, useContext } from "react";
import { toast } from "react-toastify";
import browser from "webextension-polyfill";
import { getTheme } from "~/app/utils";
import api from "~/common/lib/api";
import { getFiatValue as getFiatValueFunc } from "~/common/utils/currencyConvert";
import { DEFAULT_SETTINGS } from "~/extension/background-script/state";
import type { SettingsStorage } from "~/types";

interface SettingsContextType {
  settings: SettingsStorage;
  updateSetting: (setting: Setting) => void;
  isLoading: boolean;
  getFiatValue: (amount: number | string) => Promise<string>;
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
  const [currencyRate, setCurrencyRate] = useState(0);

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
    // setTimeout(() => {
    // console.log("SETTIMGS CONTEXT EFFECT 123");
    // api
    //   .getSettings()
    browser.storage.sync
      .get("settings")
      .then(({ settings }) => {
        // console.log("SETTINGS RESPONSE: ", settings);

        setSettings(settings);
      })
      .catch((e) => {
        toast.error(
          `SettingsProvider: An unexpected error occurred (${e.message})`
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
    // }, 1000);
  }, []);

  // update rate
  useEffect(() => {
    console.log("effect - getCurrencyRate");

    api.getCurrencyRate().then((response) => {
      console.log("effect - getCurrencyRate - response", response);
      setCurrencyRate(response.rate);
    });
  }, [settings.currency]);

  const getFiatValue = async (amount: number | string) =>
    await getFiatValueFunc({
      amount,
      rate: currencyRate,
      currency: settings.currency,
    });

  // update locale on every change
  useEffect(() => {
    i18n.changeLanguage(settings.locale);

    // need to switch i.e. `pt_BR` to `pt-br`
    const daysjsLocaleFormatted = settings.locale
      .toLocaleLowerCase()
      .replace("_", "-");
    dayjs.locale(daysjsLocaleFormatted);
  }, [settings.locale]);

  // update theme on every change
  useEffect(() => {
    getTheme(); // Get the active theme and apply corresponding Tailwind classes to the document
  }, [settings.theme]);

  const value = {
    getFiatValue,
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
