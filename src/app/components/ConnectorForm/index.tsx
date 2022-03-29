import { FormEventHandler } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../Button";

type Props = {
  title: string;
  description?: string | React.ReactNode;
  submitLabel?: string;
  submitLoading?: boolean;
  submitDisabled?: boolean;
  onSubmit: FormEventHandler;
  children: React.ReactNode;
};

function ConnectorForm({
  title,
  description,
  submitLabel = "Continue",
  submitLoading = false,
  submitDisabled = false,
  onSubmit,
  children,
}: Props) {
  const navigate = useNavigate();

  return (
    <form onSubmit={onSubmit}>
      <div className="relative lg:flex mt-14 bg-white dark:bg-gray-800 px-10 py-12">
        <div className="lg:w-1/2">
          <h1 className="text-2xl font-bold dark:text-white">{title}</h1>
          {description && (
            <div className="text-gray-500 mt-6 dark:text-gray-400">
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
            <img src="assets/icons/satsymbol.svg" alt="sat" className="w-64" />
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
