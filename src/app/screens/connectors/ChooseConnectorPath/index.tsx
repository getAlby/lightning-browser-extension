import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Button from "~/app/components/Button";
import ConnectorPath from "~/app/components/ConnectorPath";
import getConnectorRoutes from "~/app/router/connectorRoutes";
import i18n from "~/i18n/i18nConfig";

import alby from "/static/assets/icons/alby.png";

type Props = {
  title: string;
  description: string;
};

export default function ChooseConnectorPath({ title, description }: Props) {
  let connectorRoutes = getConnectorRoutes();
  i18n.on("languageChanged", () => {
    connectorRoutes = getConnectorRoutes();
  });
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_path",
  });
  const { t: tCommon } = useTranslation("common");
  return (
    <div className="relative mt-14 lg:grid lg:gap-8 text-center">
      <div className="relative">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">{title}</h1>
          {description && (
            <p className="text-gray-500 mt-6 dark:text-neutral-400 w-full">
              {description}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 xl:gap-18 mt-8 mb-4 lg:my-12">
          <ConnectorPath
            title={t("alby.title")}
            description={t("alby.description")}
            content={
              <img src={alby} alt="logo" className="inline rounded-3xl w-32" />
            }
            actions={
              <>
                <Link to="create" className="flex flex-1">
                  <Button label={t("alby.create_new")} primary flex />
                </Link>
                <Link to="login" className="flex flex-1">
                  <Button label={tCommon("actions.log_in")} outline flex />
                </Link>
              </>
            }
          />
          <ConnectorPath
            title={t("other.title")}
            description={t("other.description")}
            content={
              <Link
                to="choose-connector"
                className="flex flex-wrap gap-6 w-72 lg:w-80 mx-auto my-5 items-center"
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
                <Button label={t("other.connect")} primary flex />
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
}
