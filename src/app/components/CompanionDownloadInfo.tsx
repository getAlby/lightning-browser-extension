import {
  ArrowDownIcon,
  CheckIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "~/app/components/Button";

type Props = {
  hasTorCallback: () => void;
};

function CompanionDownloadInfo({ hasTorCallback }: Props) {
  const [hasTorSupport, setHasTorSupport] = useState(false);
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

  // TODO: check if the companion app is already installed
  return (
    <>
      {!hasTorSupport && (
        <div className="dark:text-white">
          <p className="mb-2 bg-sky-300 p-4">{t("description")}</p>
          <div className="p-4">
            <div className="flex mb-4 space-x-4">
              <Button
                fullWidth
                icon={<ArrowDownIcon className="w-6 h-6" />}
                label={t("download_here")}
                direction="column"
                onClick={() => {
                  window.open(
                    `https://getalby.com/install/companion/${getOS()}`,
                    "_blank"
                  );
                }}
              />
              <Button
                fullWidth
                icon={<CheckIcon className="w-6 h-6" />}
                label={"Continue without installation"}
                direction="column"
                onClick={(e) => {
                  e.preventDefault();
                  setHasTorSupport(true);
                  hasTorCallback();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CompanionDownloadInfo;
