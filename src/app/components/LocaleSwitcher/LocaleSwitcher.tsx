import { useState } from "react";
import type { ChangeEvent } from "react";
import i18n from "i18next";
import "../../../i18n/i18nConfig";
import api from "../../../common/lib/api";

export default function LocaleSwitcher() {
  const [dropdownLang, setDropdownLang] = useState(i18n.language || "en");
  const languageHandler = async (event: ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value;
    if (dropdownLang !== newLanguage) {
      setDropdownLang(newLanguage);
      i18n.changeLanguage(newLanguage);
      await api.setSetting({ locale: newLanguage });
    }
  };
  return (
    <select
      value={dropdownLang}
      className="form-select border-0 rounded-md mr-4 mt-1 pt-3 bg-gray-100 dark:bg-gray-600 float-right text-gray-500 dark:text-white"
      onChange={languageHandler}
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
    </select>
  );
}
