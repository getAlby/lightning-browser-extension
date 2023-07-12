import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Button from "~/app/components/Button";
import ConnectorPath from "~/app/components/ConnectorPath";
import { getConnectorRoutes } from "~/app/router/connectorRoutes";
import ConnectAlby from "~/app/screens/connectors/ConnectAlby";
import i18n from "~/i18n/i18nConfig";

import alby from "/static/assets/icons/alby.png";

export default function ChooseConnectorPath() {
  let connectorRoutes = getConnectorRoutes();

  i18n.on("languageChanged", () => {
    connectorRoutes = getConnectorRoutes();
  });
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_path",
  });

  return (
    <div className="relative mt-10 lg:grid lg:gap-8 text-center">
      <div className="relative">
        <div className="grid lg:grid-cols-2 gap-10 mb-4">
          <ConnectorPath
            title={t("alby.title")}
            description={t("alby.description")}
            content={
              <img src={alby} alt="logo" className="inline rounded-3xl w-32" />
            }
            actions={<ConnectAlby />}
          />
          <ConnectorPath
            title={t("other.title")}
            description={t("other.description")}
            content={
              <Link
                to="choose-connector"
                className="flex flex-wrap gap-6 w-72 lg:w-80 mx-auto my-5 items-center"
                tabIndex={-1}
              >
                {connectorRoutes.slice(1, 8).map(({ path, title, logo }) => (
                  <img
                    key={path}
                    title={title}
                    src={logo}
                    alt="logo"
                    className="inline rounded-lg w-12"
                  />
                ))}
                <p className="text-gray-500 dark:text-neutral-400">
                  {t("other.and_more")}
                </p>
              </Link>
            }
            actions={
              <Link to="choose-connector" className="flex flex-1">
                <Button tabIndex={-1} label={t("other.connect")} primary flex />
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
}
