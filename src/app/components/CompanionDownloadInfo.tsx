import { ReceiveIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { useTranslation } from "react-i18next";

function CompanionDownloadInfo() {
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
    <div className="dark:text-white">
      {t("info")}{" "}
      <a
        href={`https://getalby.com/install/companion/${getOS()}`}
        target="_blank"
        rel="noreferrer"
      >
        {t("download_here")}
        <ReceiveIcon className="w-6 h-6 inline" />.
      </a>
    </div>
  );
}

export default CompanionDownloadInfo;
