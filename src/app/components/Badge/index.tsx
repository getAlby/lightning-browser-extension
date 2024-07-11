import { PopiconsXLine } from "@popicons/react";
import { classNames } from "~/app/utils";

type Props = {
  label: string;
  className: string;
  onDelete?: () => void;
  description?: string;
};

export default function Badge({
  label,
  className,
  onDelete,
  description,
}: Props) {
  return (
    <div
      className={classNames(
        "inline-flex items-center leading-none rounded-full font-medium py-1.5 px-2 text-xs cursor-default",
        className
      )}
      title={description}
    >
      {label.toUpperCase()}
      {onDelete && (
        <button
          type="button"
          onClick={() => {
            onDelete();
          }}
          className="text-gray-400 dark:text-neutral-600 hover:text-gray-600 dark:hover:text-neutral-400"
        >
          <PopiconsXLine className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
