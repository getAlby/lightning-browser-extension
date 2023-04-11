import Button from "@components/Button";
import LinkButton from "@components/LinkButton";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
  const { t: tCommon } = useTranslation("common");

  const navigate = useNavigate();

  return (
    <>
      <div className="relative mt-14 mb-4 lg:mb-14 lg:grid lg:gap-8 text-center">
        <div className="relative">
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
          <div className="flex flex-row flex-wrap gap-4 justify-center">
            {connectorRoutes.map(({ path, title, logo }) => (
              <div
                key={path}
                className="basis-1/2-gap-4 md:basis-1/3-gap-4 lg:basis-1/5-gap-4"
              >
                <LinkButton to={path} title={title} logo={logo} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-4 mt-8 md:my-8 flex flex-col-reverse justify-center gap-4 md:flex-row">
        <Button
          label={tCommon("actions.back")}
          onClick={() => navigate(-1)}
          className="max-sm:w-full"
        />
      </div>
    </>
  );
}
