import { useState, useEffect, createContext, useContext } from "react";
import { toast } from "react-toastify";
import api from "~/common/lib/api";
import { DEFAULT_SETTINGS } from "~/extension/background-script/state";
import type { SettingsStorage } from "~/types";

interface SettingsContextType {
  settings: SettingsStorage;
  updateSetting: (setting: Setting) => void;
  isLoading: boolean;
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
  // call this to trigger a re-render on all occassions
  const updateSetting = (setting: Setting) =>
    setSettings((prevState) => ({
      ...prevState,
      ...setting,
    }));

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

  const value = {
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
