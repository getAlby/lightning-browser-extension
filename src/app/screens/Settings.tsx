import { CrossIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import Button from "@components/Button";
import Container from "@components/Container";
import LocaleSwitcher from "@components/LocaleSwitcher/LocaleSwitcher";
import PasswordForm from "@components/PasswordForm";
import Setting from "@components/Setting";
import Input from "@components/form/Input";
import Select from "@components/form/Select";
import Toggle from "@components/form/Toggle";
import { Html5Qrcode } from "html5-qrcode";
import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { CURRENCIES } from "~/common/constants";
import utils from "~/common/lib/utils";

const initialFormData = {
  password: "",
  passwordConfirmation: "",
};

function Settings() {
  const { t } = useTranslation("translation", { keyPrefix: "settings" });
  const { isLoading, settings, updateSetting } = useSettings();
  const { fetchAccountInfo } = useAccount();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const [cameraPermissionsGranted, setCameraPermissionsGranted] =
    useState(false);

  function closeModal() {
    setModalIsOpen(false);
  }

  async function updateAccountPassword(password: string) {
    await utils.call("changePassword", {
      password: formData.password,
    });
    toast.success(t("change_password.success"));
    closeModal();
  }

  async function saveSetting(
    setting: Record<string, string | number | boolean>
  ) {
    // ensure to update SettingsContext
    updateSetting(setting);
  }

  return (
    <Container>
      <h2 className="mt-12 mb-6 text-2xl font-bold dark:text-white">
        {t("title")}
      </h2>
      <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-gray-200 dark:divide-white/10 dark:bg-surface-02dp">
        <Setting
          title={t("browser_notifications.title")}
          subtitle={t("browser_notifications.subtitle")}
        >
          {!isLoading && (
            <Toggle
              checked={settings.browserNotifications}
              onChange={() => {
                saveSetting({
                  browserNotifications: !settings.browserNotifications,
                });
              }}
            />
          )}
        </Setting>
        <Setting
          title={t("website_enhancements.title")}
          subtitle={t("website_enhancements.subtitle")}
        >
          {!isLoading && (
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
          title={t("camera_access.title")}
          subtitle={t("camera_access.subtitle")}
        >
          {!cameraPermissionsGranted ? (
            <Button
              label={t("camera_access.allow")}
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
              {t("camera_access.granted")}
            </p>
          )}
        </Setting>
        <Setting
          title={t("language.title")}
          subtitle={
            <Trans
              i18nKey={"language.subtitle"}
              t={t}
              components={[
                // eslint-disable-next-line react/jsx-key
                <a
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                  href="https://hosted.weblate.org/projects/getalby-lightning-browser-extension/getalby-lightning-browser-extension/"
                ></a>,
              ]}
            />
          }
        >
          <div className="w-64">
            <LocaleSwitcher />
          </div>
        </Setting>
        <Setting title={t("theme.title")} subtitle={t("theme.subtitle")}>
          {!isLoading && (
            <div className="w-64">
              <Select
                name="theme"
                value={settings.theme}
                onChange={async (event) => {
                  await saveSetting({
                    theme: event.target.value,
                  });
                }}
              >
                <option value="dark">{t("theme.options.dark")}</option>
                <option value="light">{t("theme.options.light")}</option>
                <option value="system">{t("theme.options.system")}</option>
              </Select>
            </div>
          )}
        </Setting>

        <Setting
          title={t("change_password.title")}
          subtitle={t("change_password.subtitle")}
        >
          {!isLoading && (
            <div className="w-64">
              <Button
                onClick={() => {
                  setModalIsOpen(true);
                }}
                label={t("change_password.title")}
                primary
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              />
            </div>
          )}
        </Setting>

        <Setting
          title={t("show_fiat.title")}
          subtitle={t("show_fiat.subtitle")}
        >
          {!isLoading && (
            <Toggle
              checked={settings.showFiat}
              onChange={() => {
                saveSetting({
                  showFiat: !settings.showFiat,
                });
              }}
            />
          )}
        </Setting>

        {settings.showFiat && (
          <>
            <Setting
              title={t("currency.title")}
              subtitle={t("currency.subtitle")}
            >
              {!isLoading && (
                <div className="w-64">
                  <Select
                    name="currency"
                    value={settings.currency}
                    onChange={async (event) => {
                      fetchAccountInfo();
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

            <Setting
              title={t("exchange.title")}
              subtitle={t("exchange.subtitle")}
            >
              {!isLoading && (
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
          </>
        )}
      </div>

      <h2 className="mt-12 text-2xl font-bold dark:text-white">
        {t("personal_data.title")}
      </h2>

      <p className="mb-6 text-gray-500 dark:text-neutral-500 text-sm">
        {t("personal_data.description")}
      </p>

      <div className="mb-12 shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp">
        <Setting title={t("name.title")} subtitle={t("name.subtitle")}>
          {!isLoading && (
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
          {!isLoading && (
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

        <Modal
          closeTimeoutMS={200}
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel={t("change_password.content_label")}
          overlayClassName="bg-black bg-opacity-25 fixed inset-0 flex justify-center items-center p-5"
          className="rounded-lg bg-white w-full max-w-lg"
        >
          <div className="p-5 flex justify-between dark:bg-surface-02dp">
            <h2 className="text-2xl font-bold dark:text-white">
              {t("change_password.title")}
            </h2>
            <button onClick={closeModal}>
              <CrossIcon className="w-6 h-6 dark:text-white" />
            </button>
          </div>

          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              updateAccountPassword(formData.password);
            }}
          >
            <div className="p-5 border-t border-b border-gray-200 dark:bg-surface-02dp dark:border-neutral-500">
              <PasswordForm
                i18nKeyPrefix="settings.change_password"
                formData={formData}
                setFormData={setFormData}
              />
            </div>

            <div className="flex justify-end p-5 dark:bg-surface-02dp">
              <Button
                label={t("change_password.submit.label")}
                type="submit"
                primary
                disabled={
                  !formData.password ||
                  formData.password !== formData.passwordConfirmation
                }
              />
            </div>
          </form>
        </Modal>
      </div>

      <h2 className="mt-12 text-2xl font-bold dark:text-white">
        {t("lnurl_auth.title")}
      </h2>

      <p className="mb-6 text-gray-500 dark:text-neutral-500 text-sm">
        <a
          href="https://lightninglogin.live/learn"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          {t("lnurl_auth.title")}
        </a>{" "}
        {t("lnurl_auth.hint")}
      </p>

      <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp">
        <Setting
          title={t("lnurl_auth.legacy_lnurl_auth_202207.title")}
          subtitle={t("lnurl_auth.legacy_lnurl_auth_202207.subtitle")}
        >
          {!isLoading && (
            <Toggle
              checked={settings.isUsingLegacyLnurlAuthKey}
              onChange={() => {
                saveSetting({
                  isUsingLegacyLnurlAuthKey:
                    !settings.isUsingLegacyLnurlAuthKey,
                });
              }}
            />
          )}
        </Setting>

        <Setting
          title={t("lnurl_auth.legacy_lnurl_auth.title")}
          subtitle={t("lnurl_auth.legacy_lnurl_auth.subtitle")}
        >
          {!isLoading && (
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
      </div>
    </Container>
  );
}

export default Settings;
