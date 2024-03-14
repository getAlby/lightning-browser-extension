import { CrossIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { classNames } from "~/app/utils";

type Props = {
  label?: "budget" | "auth" | "imported";
  sitePermission?: string;
  className: string;
  delete?: () => void;
};

export default function Badge({
  label,
  className,
  sitePermission,
  delete: deletePermission,
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
            "inline-flex items-center leading-none rounded-full font-medium mr-2 py-1 pr-2 pl-3 my-2 text-xs",
            className
          )}
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
              <CrossIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
