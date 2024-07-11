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
import { Trans, useTranslation } from "react-i18next";
import Modal from "~/app/components/Modal";
import toast from "~/app/components/Toast";
import { useSettings } from "~/app/context/SettingsContext";
import { CURRENCIES } from "~/common/constants";
import msg from "~/common/lib/msg";

const initialFormData = {
  password: "",
  passwordConfirmation: "",
};

function Settings() {
  const { t } = useTranslation("translation", { keyPrefix: "settings" });
  const { isLoading, settings, updateSetting } = useSettings();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const [cameraPermissionsGranted, setCameraPermissionsGranted] =
    useState(false);

  function closeModal() {
    setModalIsOpen(false);
  }

  async function updateAccountPassword(password: string) {
    try {
      await msg.request("changePassword", {
        password: formData.password,
      });

      toast.success(t("change_password.success"));
      closeModal();
    } catch (e) {
      console.error(e);
      if (e instanceof Error)
        toast.error(`An unexpected error occurred: ${e.message}`);
    }
  }

  async function saveSetting(
    setting: Record<string, string | number | boolean>
  ) {
    // ensure to update SettingsContext
    updateSetting(setting);
  }

  return (
    <Container>
      <div className="flex flex-col gap-12 mt-12">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold dark:text-white leading-8">
              {t("title")}
            </h2>

            <p className="text-gray-600 dark:text-neutral-400 text-sm leading-5">
              {t("subtitle")}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold dark:text-white leading-7">
              {t("general.title")}
            </h2>

            <div className="shadow bg-white rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-gray-200 dark:divide-white/10 dark:bg-surface-02dp">
              <Setting
                title={t("browser_notifications.title")}
                subtitle={t("browser_notifications.subtitle")}
                inline={true}
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
                inline={true}
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
                    className="sm:w-64 flex-none w-full mt-4 sm:mt-0"
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
                  <p className="text-green-500 font-medium pt-2 sm:pt-0">
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
                        rel="noreferrer noopener"
                        href="https://hosted.weblate.org/projects/getalby-lightning-browser-extension/getalby-lightning-browser-extension/"
                      ></a>,
                    ]}
                  />
                }
              >
                <div className="sm:w-64 w-full pt-4 sm:pt-0">
                  <LocaleSwitcher className="w-full border-gray-300 rounded-md shadow-sm text-gray-700 bg-white dark:bg-surface-00dp dark:text-neutral-200 dark:border-neutral-800" />
                </div>
              </Setting>
              <Setting title={t("theme.title")} subtitle={t("theme.subtitle")}>
                {!isLoading && (
                  <div className="sm:w-64 flex-none w-full pt-4 sm:pt-0">
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
                      <option value="system">
                        {t("theme.options.system")}
                      </option>
                    </Select>
                  </div>
                )}
              </Setting>

              <Setting
                title={t("change_password.title")}
                subtitle={t("change_password.subtitle")}
              >
                {!isLoading && (
                  <div className="sm:w-64 w-full pt-4 sm:pt-0">
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
                inline={true}
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
                      <div className="sm:w-64 w-full pt-4 sm:pt-0">
                        <Select
                          name="currency"
                          value={settings.currency}
                          onChange={async (event) => {
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
                      <div className="sm:w-64 w-full pt-4 sm:pt-0">
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
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold dark:text-white">
              {t("personal_data.title")}
            </h2>

            <p className="text-gray-600 dark:text-neutral-400 text-sm">
              {t("personal_data.description")}
            </p>
          </div>

          <div className="shadow bg-white rounded-md sm:overflow-hidden mb-5 px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp">
            <Setting title={t("name.title")} subtitle={t("name.subtitle")}>
              {!isLoading && (
                <div className="sm:w-64 w-full mt-1 sm:mt-0">
                  <Input
                    placeholder={t("name.placeholder")}
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
                <div className="sm:w-64 w-full mt-1 sm:mt-0">
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
              isOpen={modalIsOpen}
              close={closeModal}
              contentLabel={t("change_password.screen_reader")}
              title={t("change_password.title")}
            >
              <form
                onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  updateAccountPassword(formData.password);
                }}
              >
                <PasswordForm
                  i18nKeyPrefix="settings.change_password"
                  formData={formData}
                  setFormData={setFormData}
                />

                <div className="flex justify-center mt-6">
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
        </div>
      </div>
    </Container>
  );
}

export default Settings;
