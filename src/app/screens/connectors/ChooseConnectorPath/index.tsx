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
    <div className="mx-auto max-w-3xl">
      <div className="relative">
        <h1 className="text-2xl font-bold dark:text-white text-center mb-8">
          {t("title")}
        </h1>
        <div className="grid lg:grid-cols-2 gap-8 mb-4">
          <ConnectorPath
            title={t("alby.title")}
            icon={
              <img
                src="assets/icons/alby.png"
                className="w-10 h-10 rounded-md"
              />
            }
            description={t("alby.description")}
            actions={<ConnectAlby />}
          />
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
            actions={
              <Link to="choose-connector" className="flex flex-1">
                <Button tabIndex={-1} label={t("other.connect")} flex />
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
}
