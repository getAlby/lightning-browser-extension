import type { FallbackLng } from "i18next";
import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useSettings } from "~/app/context/SettingsContext";
import i18n, { supportedLocales } from "~/i18n/i18nConfig";

import Select from "../form/Select";

export default function LocaleSwitcher() {
  const { settings, updateSetting } = useSettings();
  const fallbackLng = i18n.options.fallbackLng?.[0 as keyof FallbackLng];
  const [dropdownLang, setDropdownLang] = useState(
    i18n.language || fallbackLng
  );

  // loading settings can be slow, make sure that settings win
  useEffect(() => {
    if (dropdownLang !== settings.locale) {
      setDropdownLang(settings.locale);
    }
  }, [dropdownLang, settings.locale]);

  const languageHandler = async (event: ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value;

    if (dropdownLang !== newLanguage) {
      setDropdownLang(newLanguage);
      updateSetting({ locale: newLanguage });
    }
  };

  return (
    <Select name="locale" value={dropdownLang} onChange={languageHandler}>
      {supportedLocales.map((locale) => (
        <option key={locale.locale} value={locale.locale}>
          {locale.label}
        </option>
      ))}
    </Select>
  );
}
