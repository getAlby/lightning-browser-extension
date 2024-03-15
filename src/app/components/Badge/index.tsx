import { PopiconsXLine } from "@popicons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { classNames } from "~/app/utils";

type Props = {
  label?: "budget" | "auth" | "imported";
  sitePermission?: string;
  className: string;
  delete?: () => void;
  description?: string;
};

export default function Badge({
  label,
  className,
  sitePermission,
  delete: deletePermission,
  description,
}: Props) {
  const { t: tComponents } = useTranslation("components", {
    keyPrefix: "badge",
  });

  const [showBadge, setShowBadge] = useState(true);

  return (
    <>
      {showBadge && (
        <div
          className={classNames(
            "inline-flex items-center leading-none rounded-full font-medium mr-2 py-1 pr-2 pl-3 mb-2 text-xs cursor-default uppercase",
            className
          )}
          title={description}
        >
          {label ? tComponents(`label.${label}`) : sitePermission}
          {deletePermission && (
            <button
              type="button"
              onClick={() => {
                deletePermission();
                setShowBadge(false);
              }}
              className="text-gray-400 dark:text-neutral-600 hover:text-gray-600 dark:hover:text-neutral-400"
            >
              <PopiconsXLine className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
