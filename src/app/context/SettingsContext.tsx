import i18n from "i18next";
import { useState, useEffect, createContext, useContext } from "react";
import { toast } from "react-toastify";
import { getTheme } from "~/app/utils";
import api from "~/common/lib/api";
import { satoshisToFiat } from "~/common/utils/currencyConvert";
import { DEFAULT_SETTINGS } from "~/extension/background-script/state";
import type { SettingsStorage } from "~/types";

interface SettingsContextType {
  settings: SettingsStorage;
  updateSetting: (setting: Setting) => void;
  isLoading: boolean;
  getCachedFiatValue: FixMe;
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
    api
      .getSettings()
      .then((response) => {
        setSettings(response);
      })
      .catch((e) => {
        toast.error(
          `SettingsProvider: An unexpected error occurred (${e.message})`
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // update rate
  useEffect(() => {
    api.getCurrencyRate({ currency: settings.currency }).then((response) => {
      console.log({ response });

      setCurrencyRate(response.rate);
    });
  }, [settings.currency]);

  const getCachedFiatValue = async (amount) => {
    console.log("getCachedFiatValue", amount);

    const fiatValue = await satoshisToFiat({
      amountInSats: amount,
      convertTo: settings.currency,
      rate: currencyRate,
    });

    return fiatValue.toLocaleString("en", {
      style: "currency",
      currency: settings.currency,
    });
  };

  // update locale on every change
  useEffect(() => {
    i18n.changeLanguage(settings.locale);
  }, [settings.locale]);

  // update theme on every change
  useEffect(() => {
    getTheme(); // Get the active theme and apply corresponding Tailwind classes to the document
  }, [settings.theme]);

  const value = {
    getCachedFiatValue,
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
