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
import { useState, useEffect } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { getTheme } from "~/app/utils";
import { CURRENCIES } from "~/common/constants";
import api from "~/common/lib/api";
import utils from "~/common/lib/utils";
import { SettingsStorage } from "~/types";

const initialFormData = {
  password: "",
  passwordConfirmation: "",
};

function Settings() {
  const { fetchAccountInfo } = useAccount();

  const [loading, setLoading] = useState(true);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
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

  function closeModal() {
    setModalIsOpen(false);
  }

  async function updateAccountPassword(password: string) {
    await utils.call("changePassword", {
      password: formData.password,
    });
    toast.success("Password changed successfully!");
    closeModal();
  }

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
        Settings
      </h2>
      <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-gray-200 dark:divide-white/10 dark:bg-surface-02dp">
        <Setting
          title="Website enhancements"
          subtitle="Tipping enhancements for Twitter, YouTube, etc."
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
          title="Legacy signing for LNDhub and LNBits"
          subtitle="Message signing and login with LNDhub and LNbits accounts has been changed. If you logged in with these accounts you can still enable the old signing method. This option will be removed later, make sure to switch to the new login."
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

        <Setting title="Camera access" subtitle="For scanning QR codes">
          {!cameraPermissionsGranted ? (
            <Button
              label="Allow camera access"
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
            <p className="text-green-500 font-medium">Permission granted</p>
          )}
        </Setting>

        <Setting
          title="Language"
          subtitle="Alby goes international! help us translate Alby in your language"
        >
          <div className="w-32">
            <LocaleSwitcher />
          </div>
        </Setting>

        <Setting title="Theme" subtitle="Change the app theme to dark or light">
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
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </Select>
            </div>
          )}
        </Setting>

        <Setting
          title="Currency"
          subtitle="Change the currency display within Alby"
        >
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

        <Setting
          title="Exchange Source"
          subtitle="Change the source where Alby get currency info"
        >
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
        Personal data
      </h2>

      <p className="mb-6 text-gray-500 dark:text-neutral-500 text-sm">
        Payees can request for additional data to be sent with a payment. This
        data is not shared with anyone without your consent, you will always be
        prompted before this data is sent along with a payment.
      </p>

      <div className="mb-12 shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-gray-200 dark:divide-white/10 dark:bg-surface-02dp">
        <Setting title="Name" subtitle="">
          {!loading && (
            <div className="w-64">
              <Input
                placeholder="Enter your name"
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

        <Setting title="Email" subtitle="">
          {!loading && (
            <div className="w-64">
              <Input
                placeholder="Enter your email address"
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
        <Setting title="Change Password" subtitle="">
          {!loading && (
            <div className="w-64">
              <Button
                onClick={() => {
                  setModalIsOpen(true);
                }}
                label="Change Password"
                primary
                fullWidth
                loading={loading}
                disabled={loading}
              />
            </div>
          )}
        </Setting>

        <Modal
          closeTimeoutMS={200}
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Edit account name"
          overlayClassName="bg-black bg-opacity-25 fixed inset-0 flex justify-center items-center p-5"
          className="rounded-lg bg-white w-full max-w-lg"
        >
          <div className="p-5 flex justify-between dark:bg-surface-02dp">
            <h2 className="text-2xl font-bold dark:text-white">
              Change Password
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
                label="Change"
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
    </Container>
  );
}

export default Settings;
