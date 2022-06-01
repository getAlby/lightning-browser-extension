import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "react-toastify";

import api from "~/common/lib/api";
import { SettingsStorage } from "~/types";
import { getTheme } from "~/app/utils";
import Container from "@components/Container";
import Button from "@components/Button";
import Toggle from "@components/form/Toggle";
import Input from "@components/form/Input";
import Setting from "@components/Setting";
import Select from "@components/form/Select";
import LocaleSwitcher from "@components/LocaleSwitcher/LocaleSwitcher";

function Settings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsStorage>({
    websiteEnhancements: false,
    legacyLnurlAuth: false,
    userName: "",
    userEmail: "",
    locale: "",
    theme: "system",
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
        Settings
      </h2>
      <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp">
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
                onChange={async (ev) => {
                  await saveSetting({
                    theme: ev.target.value,
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
      </div>
      <h2 className="mt-12 text-2xl font-bold dark:text-white">
        Personal data
      </h2>
      <div className="mb-6 text-gray-500 dark:text-neutral-500 text-sm">
        Payees can request for additional data to be sent with a payment. This
        data is not shared with anyone without your consent, you will always be
        prompted before this data is sent along with a payment.
      </div>
      <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp">
        <Setting title="Name" subtitle="">
          {!loading && (
            <div className="w-64">
              <Input
                placeholder="Enter your name"
                type="text"
                value={settings.userName}
                onChange={(ev) => {
                  saveSetting({
                    userName: ev.target.value,
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
                onChange={(ev) => {
                  saveSetting({
                    userEmail: ev.target.value,
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
