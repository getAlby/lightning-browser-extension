import LinkButton from "@components/LinkButton";
import { ConnectorRoute } from "~/app/router/connectorRoutes";

type Props = {
  connectorRoutes: ConnectorRoute[];
  title: string;
  description?: string;
};

export default function ChooseConnector({
  title,
  description,
  connectorRoutes,
}: Props) {
  return (
    <>
      <div className="mt-14 mb-4 lg:mb-14 lg:grid lg:gap-8 text-center">
        <div className="mb-6 flex flex-col items-center w-full">
          <h1 className="text-3xl font-bold dark:text-white max-md:w-64">
            {title}
          </h1>
          {description && (
            <p className="text-gray-500 mt-6 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
        <div className="flex flex-row flex-wrap justify-center -mb-4 -mx-2">
          {connectorRoutes.map(({ path, title, logo }) => (
            <div
              key={path}
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/5 mb-4 px-2"
            >
              <LinkButton to={path} title={title} logo={logo} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
