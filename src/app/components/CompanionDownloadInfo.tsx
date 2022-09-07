import { ReceiveIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  hasTorCallback: () => void;
};

function CompanionDownloadInfo({ hasTorCallback }: Props) {
  const [hasTorSupport, setHasTorSupport] = useState(false);
  const { t } = useTranslation("components", {
    keyPrefix: "companionDownloadInfo",
  });

  function getOS() {
    if (navigator.appVersion.indexOf("Win") != -1) return "Windows";
    if (navigator.appVersion.indexOf("Mac") != -1) return "MacOS";
    if (navigator.appVersion.indexOf("X11") != -1) return "UNIX";
    if (navigator.appVersion.indexOf("Linux") != -1) return "Linux";
  }

  // TODO: check if the companion app is already installed
  return (
    <>
      {!hasTorSupport && (
        <div className="dark:text-white">
          <p className="mb-2">{t("info")} </p>
          <p className="mb-2">
            <a
              href={`https://getalby.com/install/companion/${getOS()}`}
              target="_blank"
              rel="noreferrer"
              className="font-bold"
            >
              {t("download_here")}
              <ReceiveIcon className="w-6 h-6 inline" />
            </a>
          </p>
          <p>
            {t("or")}{" "}
            <a
              href="#"
              className="font-bold"
              onClick={(e) => {
                e.preventDefault();
                setHasTorSupport(true);
                hasTorCallback();
              }}
            >
              {t("using_tor")}
            </a>
          </p>
        </div>
      )}
    </>
  );
}

export default CompanionDownloadInfo;
