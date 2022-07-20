import Button from "@components/Button";
import Container from "@components/Container";
import LocaleSwitcher from "@components/LocaleSwitcher/LocaleSwitcher";
import Setting from "@components/Setting";
import Input from "@components/form/Input";
import Select from "@components/form/Select";
import Toggle from "@components/form/Toggle";
import { Html5Qrcode } from "html5-qrcode";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { getTheme } from "~/app/utils";
import { CURRENCIES } from "~/common/constants";
import api from "~/common/lib/api";
import { SettingsStorage } from "~/types";

function Settings() {
  const { t } = useTranslation("translation", { keyPrefix: "settings" });

  const { fetchAccountInfo } = useAccount();

  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<SettingsStorage>({
    websiteEnhancements: false,
    legacyLnurlAuth: false,
    userName: "",
    userEmail: "",
    locale: "",
    theme: "system",
    currency: CURRENCIES.USD,
    exchange: "coindesk",
    debug: false,
  });

  const [cameraPermissionsGranted, setCameraPermissionsGranted] =
    useState(false);

  async function saveSetting(
    setting: Record<string, string | number | boolean>
  ) {
    const response = await api.setSetting(setting);
    setSettings(response);
  }

  useEffect(() => {
    api.getSettings().then((response) => {
      setSettings(response);
      setLoading(false);
    });
  }, []);

  return (
    <Container>
      <h2 className="mt-12 mb-6 text-2xl font-bold dark:text-white">
        {t("headline")}
      </h2>
      <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-gray-200 dark:divide-white/10 dark:bg-surface-02dp">
        <Setting
          title={t("website_enhancements.title")}
          subtitle={t("website_enhancements.subtitle")}
        >
          {!loading && (
            <Toggle
              checked={settings.websiteEnhancements}
              onChange={() => {
                saveSetting({
                  websiteEnhancements: !settings.websiteEnhancements,
                });
              }}
            />
          )}
        </Setting>

        <Setting
          title={t("legacy_lnurl_auth.title")}
          subtitle={t("legacy_lnurl_auth.subtitle")}
        >
          {!loading && (
            <Toggle
              checked={settings.legacyLnurlAuth}
              onChange={() => {
                saveSetting({
                  legacyLnurlAuth: !settings.legacyLnurlAuth,
                });
              }}
            />
          )}
        </Setting>

        <Setting
          title={t("camera_access.title")}
          subtitle={t("camera_access.subtitle")}
        >
          {!cameraPermissionsGranted ? (
            <Button
              label={t("camera_access.label")}
              onClick={async () => {
                try {
                  await Html5Qrcode.getCameras();
                  setCameraPermissionsGranted(true);
                } catch (e) {
                  if (e instanceof Error) toast.error(e.message);
                }
              }}
            />
          ) : (
            <p className="text-green-500 font-medium">
              {t("camera_access.active")}
            </p>
          )}
        </Setting>

        <Setting title={t("language.title")} subtitle={t("language.subtitle")}>
          <div className="w-32">
            <LocaleSwitcher />
          </div>
        </Setting>

        <Setting title={t("theme.title")} subtitle={t("theme.subtitle")}>
          {!loading && (
            <div className="w-64">
              <Select
                name="theme"
                value={settings.theme}
                onChange={async (event) => {
                  await saveSetting({
                    theme: event.target.value,
                  });
                  getTheme(); // Get the active theme and apply corresponding Tailwind classes to the document
                }}
              >
                <option value="dark">{t("theme.options.dark")}</option>
                <option value="light">{t("theme.options.light")}</option>
                <option value="system">{t("theme.options.system")}</option>
              </Select>
            </div>
          )}
        </Setting>

        <Setting title={t("currency.title")} subtitle={t("currency.subtitle")}>
          {!loading && (
            <div className="w-64">
              <Select
                name="currency"
                value={settings.currency}
                onChange={async (event) => {
                  fetchAccountInfo({ isLatestRate: true });
                  await saveSetting({
                    currency: event.target.value,
                  });
                }}
              >
                {Object.keys(CURRENCIES).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </Setting>

        <Setting title={t("exchange.title")} subtitle={t("exchange.subtitle")}>
          {!loading && (
            <div className="w-64">
              <Select
                name="exchange"
                value={settings.exchange}
                onChange={async (event) => {
                  // exchange/value change should be reflected in the upper account-menu after select?
                  await saveSetting({
                    exchange: event.target.value,
                  });
                }}
              >
                <option value="alby">Alby</option>
                <option value="coindesk">Coindesk</option>
                <option value="yadio">yadio</option>
              </Select>
            </div>
          )}
        </Setting>
      </div>

      <h2 className="mt-12 text-2xl font-bold dark:text-white">
        {t("personal_data.headline")}
      </h2>

      <p className="mb-6 text-gray-500 dark:text-neutral-500 text-sm">
        {t("personal_data.info")}
      </p>

      <div className="mb-12 shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp">
        <Setting title={t("name.title")} subtitle={t("name.subtitle")}>
          {!loading && (
            <div className="w-64">
              <Input
                placeholder={t("name.placeholder")}
                type="text"
                value={settings.userName}
                onChange={(event) => {
                  saveSetting({
                    userName: event.target.value,
                  });
                }}
              />
            </div>
          )}
        </Setting>

        <Setting title={t("email.title")} subtitle={t("email.subtitle")}>
          {!loading && (
            <div className="w-64">
              <Input
                placeholder={t("email.placeholder")}
                type="email"
                value={settings.userEmail}
                onChange={(event) => {
                  saveSetting({
                    userEmail: event.target.value,
                  });
                }}
              />
            </div>
          )}
        </Setting>
      </div>
    </Container>
  );
}

export default Settings;
