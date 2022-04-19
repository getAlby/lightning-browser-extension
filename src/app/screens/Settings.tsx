import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

import api from "~/common/lib/api";
import { SettingsStorage } from "~/types";

import Container from "@components/Container";
import Button from "@components/Button";
import Toggle from "@components/form/Toggle";
import Input from "@components/form/Input";
import Setting from "@components/Setting";
import LocaleSwitcher from "@components/LocaleSwitcher/LocaleSwitcher";

function Settings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsStorage>({
    websiteEnhancements: false,
    legacyLnurlAuth: false,
    userName: "",
    userEmail: "",
    locale: "",
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
      <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y dark:bg-gray-800">
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
        <Setting
          title="User Display Name"
          subtitle="For sending along with LNURL payments when supported"
        >
          {!loading && (
            <div className="w-64">
              <Input
                placeholder="Enter your username"
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

        <Setting
          title="User Email"
          subtitle="For sending along with LNURL payments when supported"
        >
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

        <Setting title="Camera access" subtitle="For scanning QR codes">
          {!cameraPermissionsGranted ? (
            <Button
              label="Allow camera access"
              onClick={async () => {
                try {
                  await Html5Qrcode.getCameras();
                  setCameraPermissionsGranted(true);
                } catch (e) {
                  alert(e);
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
      </div>
    </Container>
  );
}

export default Settings;
