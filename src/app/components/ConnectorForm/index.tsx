import { FormEventHandler } from "react";
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
  logo?: string;
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
  logo,
}: Props) {
  const media = (
    <div className="flex h-full justify-center items-center">
      {video && (
        <div
          className="flex-1 relative h-0"
          style={{ paddingBottom: "56.25%" }}
        >
          <video className="absolute t-0 l-0 w-full h-full" controls>
            <source src={video} type="video/mp4" />
          </video>
        </div>
      )}
      {image && (
        <>
          <div className="w-96">
            <img
              src={image}
              alt="Screenshot"
              className="block w-full rounded-md"
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col max-w-xl mx-auto mt-6 relative bg-white dark:bg-surface-02dp p-10 rounded-2xl border border-gray-200 dark:border-neutral-700 gap-4">
        <div className="flex items-center">
          {logo && <img src={logo} className="w-16 mr-4 rounded-lg" />}
          {/*
              TODO: this can be simplified to always wrap the title in h1, without checking if it
                      is string or Trans component, so we centralize the styles of the h1 tag in
                      just one place
          */}
          {typeof title === "string" ? (
            <h1 className="text-2xl font-bold dark:text-white">{title}</h1>
          ) : (
            title
          )}
        </div>
        {description && (
          <div className="text-gray-700 dark:text-white whitespace-pre-line">
            {typeof description === "string" ? (
              <p className="mb-6">{description}</p>
            ) : (
              description
            )}
          </div>
        )}
        {video || (image && media)}
        <div>{children}</div>
        <div className="mt-4 flex justify-center">
          <Button
            type="submit"
            label={submitLabel}
            loading={submitLoading}
            disabled={submitDisabled}
            primary
            className="w-64"
          />
        </div>
      </div>
    </form>
  );
}

export default ConnectorForm;
