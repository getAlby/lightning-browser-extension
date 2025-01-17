import { PopiconsXLine } from "@popicons/react";
import { useState } from "react";
import { classNames } from "~/app/utils";

type Props = {
  type: "warn" | "info";
  children: React.ReactNode;
  showClose?: boolean;
  onClose?: () => void;
};

export default function Alert({
  type,
  children,
  showClose = false,
  onClose,
}: Props) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={classNames(
        "border rounded-md p-3 flex justify-between relative",
        type === "warn" &&
          "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900 border-orange-100 dark:border-orange-900",
        type === "info" &&
          "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900 border-blue-100 dark:border-blue-900"
      )}
    >
      {showClose && (
        <button
          onClick={handleClose}
          className="absolute right-2 top-2 text-gray-600 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300"
          aria-label="Close alert"
        >
          <PopiconsXLine className="w-5 h-5" />
        </button>
      )}
      <div className="pr-8">{children}</div>
    </div>
  );
}
