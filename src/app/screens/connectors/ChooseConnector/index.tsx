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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
            {connectorRoutes.map(({ path, title, logo }) => (
              <LinkButton key={path} to={path} title={title} logo={logo} />
            ))}
          </div>
        </div>
      </div>
      <div className="mb-4 mt-8 md:my-8 flex flex-col-reverse justify-center gap-4 md:flex-row">
        <Button
          label={tCommon("actions.back")}
          onClick={() => {
            navigate(-1);
          }}
          className="max-sm:w-full"
        />
      </div>
    </>
  );
}
