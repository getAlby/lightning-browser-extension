import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

import utils from "../../common/lib/utils";
import type { Settings as SettingsType } from "../../types";

import Container from "../components/Container";
import Button from "../components/Button";
import Toggle from "../components/Toggle";

type Props = {
  title: string;
  subtitle: string;
  right: React.ReactNode;
};

function Setting({ title, subtitle, right }: Props) {
  return (
    <div className="py-4 flex justify-between items-center">
      <div>
        <span className="text-gray-700 font-medium">{title}</span>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

function Settings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsType>({
    websiteEnhancements: false,
  });
  const [cameraPermissionsGranted, setCameraPermissionsGranted] =
    useState(false);

  async function saveSetting(
    setting: Record<string, string | number | boolean>
  ) {
    const response = await utils.call<SettingsType>("setSetting", {
      setting,
    });
    setSettings(response);
  }

  useEffect(() => {
    utils.call<SettingsType>("getSettings").then((response) => {
      setSettings(response);
      setLoading(false);
    });
  }, []);

  return (
    <Container>
      <h2 className="mt-12 mb-6 text-2xl font-bold">Settings</h2>
      <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y">
        <Setting
          title="Website enhancements"
          subtitle="Tipping enhancements for Twitter, YouTube, etc."
          right={
            !loading && (
              <Toggle
                checked={settings.websiteEnhancements}
                onChange={() => {
                  saveSetting({
                    websiteEnhancements: !settings.websiteEnhancements,
                  });
                }}
              />
            )
          }
        />

        <Setting
          title="Camera access"
          subtitle="For scanning QR codes"
          right={
            !cameraPermissionsGranted ? (
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
            )
          }
        />
      </div>
    </Container>
  );
}

export default Settings;
