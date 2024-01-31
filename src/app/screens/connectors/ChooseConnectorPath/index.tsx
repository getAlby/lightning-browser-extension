import {
  PopiconsCircleCheckLine,
  PopiconsCircleExclamationLine,
  PopiconsCircleXLine,
} from "@popicons/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Button from "~/app/components/Button";
import ConnectorPath from "~/app/components/ConnectorPath";
import ConnectAlby from "~/app/screens/connectors/ConnectAlby";

export default function ChooseConnectorPath() {
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_path",
  });

  return (
    <div className="relative mt-10 lg:grid lg:gap-8">
      <div className="relative">
        <h1 className="text-2xl font-bold dark:text-white text-center mb-8">
          {t("title")}
        </h1>
        <div className="grid lg:grid-cols-3 gap-5 mb-4">
          <ConnectorPath
            title={t("other.title")}
            icon={
              <div className="grid grid-cols-2 gap-1">
                <img
                  src="assets/icons/lnd.png"
                  className="w-[18px] h-[18px] rounded-md"
                />
                <img
                  src="assets/icons/umbrel.png"
                  className="w-[18px] h-[18px] rounded-md"
                />
                <img
                  src="assets/icons/btcpay.svg"
                  className="w-[18px] h-[18px] rounded-md"
                />
                <img
                  src="assets/icons/core_ln.png"
                  className="w-[18px] h-[18px] rounded-md"
                />
              </div>
            }
            description={t("other.description")}
            content={
              <>
                <FeatureItem type="success">{t("other.point1")}</FeatureItem>
                <FeatureItem type="success">{t("other.point2")}</FeatureItem>
                <FeatureItem type="success">{t("other.point3")}</FeatureItem>
                <FeatureItem type="disabled">{t("other.point4")}</FeatureItem>
              </>
            }
            actions={
              <Link to="choose-connector" className="flex flex-1">
                <Button tabIndex={-1} label={t("other.connect")} primary flex />
              </Link>
            }
          />
          <ConnectorPath
            title={t("voltage.title")}
            icon={<img src="assets/icons/voltage.png" className="w-10 h-10" />}
            description={t("voltage.description")}
            content={
              <>
                <FeatureItem type="success">{t("voltage.point1")}</FeatureItem>
                <FeatureItem type="success">{t("voltage.point2")}</FeatureItem>
                <FeatureItem type="disabled">{t("voltage.point3")}</FeatureItem>
                <FeatureItem type="success">{t("voltage.point4")}</FeatureItem>
              </>
            }
            actions={
              <Link
                to="choose-connector/voltage"
                rel="noreferrer noopener"
                className="flex flex-1"
              >
                <Button
                  tabIndex={-1}
                  label={t("voltage.connect")}
                  primary
                  flex
                />
              </Link>
            }
          />
          <ConnectorPath
            title={t("alby.title")}
            icon={
              <img
                src="assets/icons/alby.png"
                className="w-10 h-10 rounded-md"
              />
            }
            description={t("alby.description")}
            content={
              <>
                <FeatureItem type="warning">{t("alby.point1")}</FeatureItem>
                <FeatureItem type="warning">{t("alby.point2")}</FeatureItem>
                <FeatureItem type="success">{t("alby.point3")}</FeatureItem>
                <FeatureItem type="success">{t("alby.point4")}</FeatureItem>
              </>
            }
            actions={<ConnectAlby />}
          />
        </div>
      </div>
    </div>
  );
}

const FeatureItem = ({
  type,
  children,
}: {
  type: "success" | "disabled" | "warning";
  children: React.ReactNode;
}) => (
  <div className="flex flex-row items-center space-2">
    <div className="mr-2">
      {type == "success" && (
        <PopiconsCircleCheckLine
          key="success"
          className="text-green-600 dark:text-green-400 w-6 h-6"
        />
      )}
      {type == "disabled" && (
        <PopiconsCircleXLine
          key="disabled"
          className="text-gray-400 dark:text-neutral-500 w-6 h-6"
        />
      )}
      {type == "warning" && (
        <PopiconsCircleExclamationLine
          key="warning"
          className="text-orange-500 w-6 h-6"
        />
      )}
    </div>
    <div className="grow">{children}</div>
  </div>
);
