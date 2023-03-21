import { MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  message: string;
  onClose: MouseEventHandler;
};

function SuccessMessage({ message, onClose }: Props) {
  const { t: tCommon } = useTranslation("common");

  return (
    <>
      <dl className="shadow bg-white dark:bg-surface-02dp pt-4 px-4 rounded-lg mb-6 overflow-hidden">
        <dt className="text-sm font-semibold text-gray-500">
          {tCommon("success")}
        </dt>
        <dd className="text-sm mb-4 dark:text-white break-all">{message}</dd>
      </dl>

      <div className="text-center">
        <button className="underline text-sm text-gray-500" onClick={onClose}>
          {tCommon("actions.close")}
        </button>
      </div>
    </>
  );
}

export default SuccessMessage;
