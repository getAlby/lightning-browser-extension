import { MouseEventHandler } from "react";

type Props = {
  message: string;
  onClose: MouseEventHandler;
};

function SuccessMessage({ message, onClose }: Props) {
  return (
    <>
      <dl className="shadow bg-white dark:bg-surface-02dp pt-4 px-4 rounded-lg mb-6 overflow-hidden">
        <dt className="text-sm font-semibold text-gray-500">Succes</dt>
        <dd className="text-sm mb-4 dark:text-white break-all">{message}</dd>
      </dl>
      <div className="text-center">
        <button className="underline text-sm text-gray-500" onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
}

export default SuccessMessage;
