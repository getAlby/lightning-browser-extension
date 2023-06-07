import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "~/app/components/Button";
import ConnectorPath from "~/app/components/ConnectorPath";
import getConnectorRoutes from "~/app/router/connectorRoutes";
import msg from "~/common/lib/msg";
import { WebLNNode } from "~/extension/background-script/connectors/connector.interface";
import i18n from "~/i18n/i18nConfig";

import alby from "/static/assets/icons/alby.png";

type Props = {
  title: string;
  description: string;
  fromWelcome?: boolean;
};

export default function ChooseConnectorPath({
  title,
  description,
  fromWelcome,
}: Props) {
  let connectorRoutes = getConnectorRoutes();

  const navigate = useNavigate();

  i18n.on("languageChanged", () => {
    connectorRoutes = getConnectorRoutes();
  });
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_path",
  });
  const { t: tCommon } = useTranslation("common");

  // TODO: rename & move to a separate file (it's only for connecting to an Alby account)
  async function connect() {
    const name = "Alby";
    const initialAccount = {
      name,
      config: {},
      connector: "alby",
    };

    try {
      const validation = await msg.request("validateAccount", initialAccount);
      if (validation.valid) {
        if (!validation.oAuthToken) {
          throw new Error("No oAuthToken returned");
        }

        const account = {
          ...initialAccount,
          name: (validation.info as { data: WebLNNode }).data.alias,
          config: {
            ...initialAccount.config,
            oAuthToken: validation.oAuthToken,
          },
        };

        const addResult = await msg.request("addAccount", account);
        if (addResult.accountId) {
          await msg.request("selectAccount", {
            id: addResult.accountId,
          });
          if (fromWelcome) {
            navigate("/pin-extension");
          } else {
            navigate("/discover");
          }
        }
      } else {
        console.error({ validation });
        toast.error(
          `${tCommon("errors.connection_failed")} (${validation.error})`
        );
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`${tCommon("errors.connection_failed")} (${e.message})`);
      }
    }
  }

  return (
    <div className="relative mt-14 lg:grid lg:gap-8 text-center">
      <div className="relative">
        <div className="w-full flex flex-col justify-center items-center">
          <h1 className="text-3xl font-bold dark:text-white">{title}</h1>
          {description && (
            <p className="text-gray-500 mt-10 dark:text-neutral-400 w-96 text-center">
              {description}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 xl:gap-18 mt-8 mb-4 lg:mt-14 lg:mb-12">
          <ConnectorPath
            title={t("alby.title")}
            description={t("alby.description")}
            content={
              <img src={alby} alt="logo" className="inline rounded-3xl w-32" />
            }
            actions={
              <Button
                className="flex flex-1 items-center"
                label="Connect With Alby"
                outline
                flex
                onClick={connect}
              />
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
