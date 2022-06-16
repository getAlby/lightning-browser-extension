import LinkButton from "@components/LinkButton";
import getConnectorRoutes from "~/app/router/connectorRoutes";
import i18n from "~/i18n/i18nConfig";

type Props = {
  title: string;
  description?: string;
};

export default function ChooseConnector({ title, description }: Props) {
  let connectorRoutes = getConnectorRoutes();
  i18n.on("languageChanged", () => {
    connectorRoutes = getConnectorRoutes();
  });
  return (
    <div className="relative my-14 lg:grid  lg:gap-8 text-center">
      <div className="relative">
        <div className="mb-6">
          <h1 className="text-3xl font-bold dark:text-white">{title}</h1>
          {description && (
            <p className="text-gray-500 mt-6 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
        <div className="grid grid-cols-5 gap-5">
          {connectorRoutes.map(({ path, title, description, logo }) => (
            <LinkButton
              key={path}
              to={path}
              title={title}
              description={description}
              logo={logo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
