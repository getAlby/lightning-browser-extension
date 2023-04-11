import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  hasTorCallback: (hasTor: boolean) => void;
};

function CompanionDownloadInfo({ hasTorCallback }: Props) {
  const [isTor, setIsTor] = useState(false);
  const { t } = useTranslation("components", {
    keyPrefix: "companion_download_info",
  });

  function getOS() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Win") !== -1) return "Windows";
    if (userAgent.indexOf("Mac") !== -1) return "MacOS";
    if (userAgent.indexOf("X11") !== -1) return "UNIX";
    if (userAgent.indexOf("Linux") !== -1) return "Linux";
  }

  function onChangeConnectionMode(isTor: boolean) {
    setIsTor(isTor);
    hasTorCallback(isTor);
  }

  // TODO: check if the companion app is already installed
  return (
    <div className="dark:text-white">
      <h3 className="mb-2 font-medium text-gray-800 dark:text-white">
        {t("heading")}
      </h3>
      <ul className="grid w-full gap-3 md:grid-cols-2">
        <li>
          <input
            type="radio"
            id="mode-companion"
            name="mode"
            value="companion"
            className="hidden peer"
            checked={!isTor}
            onChange={() => onChangeConnectionMode(false)}
          />
          <label
            htmlFor="mode-companion"
            className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-primary peer-checked:border-primary peer-checked:text-primary hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <div className="block">
              <div className="text-md font-semibold mb-2">
                {t("companion.title")}
              </div>
              <div className="text-sm mb-2">{t("companion.description")}</div>
              <div className="text-sm">
                <a
                  className="text-sky-500 hover:text-sky-300"
                  href={`https://getalby.com/install/companion/${getOS()}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("download")} &raquo;
                </a>
              </div>
            </div>
          </label>
        </li>
        <li>
          <input
            type="radio"
            id="mode-tor"
            name="mode"
            value="tor"
            className="hidden peer"
            checked={isTor}
            onChange={() => onChangeConnectionMode(true)}
          />
          <label
            htmlFor="mode-tor"
            className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-primary peer-checked:border-primary peer-checked:text-primary hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <div className="block">
              <div className="w-full font-semibold mb-2">
                {t("tor_native.title")}
              </div>
              <div className="w-full text-sm mb-2">
                {t("tor_native.description")}
              </div>
            </div>
          </label>
        </li>
      </ul>
    </div>
  );
}

export default CompanionDownloadInfo;
