import { FormEventHandler } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import i18n from "~/i18n/i18nConfig";

import Button from "../Button";

type Props = {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  submitLabel?: string;
  submitLoading?: boolean;
  submitDisabled?: boolean;
  onSubmit: FormEventHandler;
  children: React.ReactNode;
  video?: string;
  image?: string;
};

function ConnectorForm({
  title,
  description,
  submitLabel = i18n.t("common:actions.continue"),
  submitLoading = false,
  submitDisabled = false,
  onSubmit,
  children,
  video,
  image,
}: Props) {
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate();

  const media = (
    <div className="flex h-full justify-center items-center">
      {video ? (
        <div
          className="flex-1 relative h-0 max-md:mb-4"
          style={{ paddingBottom: "56.25%" }}
        >
          <video className="absolute t-0 l-0 w-full h-full" controls>
            <source src={video} type="video/mp4" />
          </video>
        </div>
      ) : (
        <>
          {image ? (
            <>
              <div className="w-full md:w-full mb-8 lg:w-full lg:mb-0">
                <img
                  src={image}
                  alt="Screenshot"
                  className="block w-full rounded-md"
                />
              </div>
            </>
          ) : (
            <>
              <div className="w-16 md:w-32 mb-8 lg:w-64 lg:mb-0">
                <img
                  src="assets/icons/alby_logo.svg"
                  alt="Alby"
                  className="block dark:hidden w-full"
                />
                <img
                  src="assets/icons/alby_logo_dark.svg"
                  alt="Alby"
                  className="hidden dark:block w-full"
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <form onSubmit={onSubmit}>
      <div className="relative lg:flex lg:gap-4 mt-14 bg-white dark:bg-surface-02dp p-10 shadow rounded-lg">
        <div className="lg:w-1/2">
          {typeof title === "string" ? (
            <h1 className="mb-1 text-2xl font-bold dark:text-white">{title}</h1>
          ) : (
            title
          )}
          <div className="lg:hidden mt-4">{media}</div>
          {description && (
            <div className="text-gray-500 dark:text-neutral-400 whitespace-pre-line mb-8">
              {typeof description === "string" ? (
                <p>{description}</p>
              ) : (
                description
              )}
            </div>
          )}
          <div className="lg:w-4/5">{children}</div>
        </div>
        <div className="hidden lg:block lg:w-1/2">{media}</div>
      </div>
      <div className="mb-4 mt-8 md:my-8 flex flex-col-reverse justify-center gap-4 md:flex-row">
        <Button
          label={tCommon("actions.back")}
          onClick={() => navigate(-1)}
          className="max-sm:w-full"
        />
        <Button
          type="submit"
          label={submitLabel}
          loading={submitLoading}
          disabled={submitDisabled}
          primary
          className="max-sm:w-full"
        />
      </div>
    </form>
  );
}

export default ConnectorForm;
