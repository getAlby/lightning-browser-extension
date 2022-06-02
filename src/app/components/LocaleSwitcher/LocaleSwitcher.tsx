import type { FallbackLng } from "i18next";
import { useState } from "react";
import type { ChangeEvent } from "react";
import api from "~/common/lib/api";
import i18n from "~/i18n/i18nConfig";

import Select from "../form/Select";

export default function LocaleSwitcher() {
  const fallbackLng = i18n.options.fallbackLng?.[0 as keyof FallbackLng];
  const [dropdownLang, setDropdownLang] = useState(
    i18n.language || fallbackLng
  );
  const languageHandler = async (event: ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value;
    if (dropdownLang !== newLanguage) {
      setDropdownLang(newLanguage);
      i18n.changeLanguage(newLanguage);
      await api.setSetting({ locale: newLanguage });
    }
  };
  return (
    <Select name="locale" value={dropdownLang} onChange={languageHandler}>
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
    </Select>
  );
}
