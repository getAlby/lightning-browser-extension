import Button from "../Button";
import { FormEventHandler } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  title: string;
  description?: string | React.ReactNode;
  submitLabel?: string;
  submitLoading?: boolean;
  submitDisabled?: boolean;
  onSubmit: FormEventHandler;
  children: React.ReactNode;
  video?: string;
};

function ConnectorForm({
  title,
  description,
  submitLabel = "Continue",
  submitLoading = false,
  submitDisabled = false,
  onSubmit,
  children,
  video,
}: Props) {
  const navigate = useNavigate();

  return (
    <form onSubmit={onSubmit}>
      <div className="relative lg:flex mt-14 bg-white dark:bg-surface-02dp px-10 py-12">
        <div className="lg:w-1/2">
          <h1 className="mb-6 text-2xl font-bold dark:text-white">{title}</h1>
          {description && (
            <div className="mb-6 text-gray-500 dark:text-gray-400">
              {typeof description === "string" ? (
                <p>{description}</p>
              ) : (
                description
              )}
            </div>
          )}
          <div className="w-4/5">{children}</div>
        </div>
        <div className="mt-16 lg:mt-0 lg:w-1/2">
          <div className="lg:flex h-full justify-center items-center">
            {video ? (
              <div
                className="flex-1 relative h-0"
                style={{ paddingBottom: "56.25%" }}
              >
                <video className="absolute t-0 l-0 w-full h-full" controls>
                  <source src={video} type="video/mp4" />
                </video>
              </div>
            ) : (
              <img
                src="assets/icons/satsymbol.svg"
                alt="sat"
                className="w-64"
              />
            )}
          </div>
        </div>
      </div>
      <div className="my-8 flex space-x-4 justify-center">
        <Button
          label="Back"
          onClick={(e) => {
            navigate(-1);
          }}
        />
        <Button
          type="submit"
          label={submitLabel}
          loading={submitLoading}
          disabled={submitDisabled}
          primary
        />
      </div>
    </form>
  );
}

export default ConnectorForm;
