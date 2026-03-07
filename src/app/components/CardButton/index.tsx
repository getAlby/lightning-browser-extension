import { FunctionComponent, SVGProps } from "react";
import { classNames } from "~/app/utils";

export type Props = {
  title: string;
  description: string;
  icon: IconType;
  onClick: () => void;
  active?: boolean;
};

interface IconTypeProps {
  className?: string;
}

type IconType = FunctionComponent<IconTypeProps & SVGProps<SVGSVGElement>>;

export default function CardButton({
  title,
  description,
  icon: Icon,
  onClick,
  active = false,
}: Props) {
  return (
    <button
      className={classNames(
        "flex flex-col flex-1 text-left border rounded-xl p-6 transition duration-200 gap-2 cursor-pointer focus:ring-1 focus:ring-primary focus:border-primary dark:focus:border-primary",
        active
          ? "border-primary bg-amber-50 dark:bg-surface-02dp ring-1 ring-primary"
          : "border-gray-200 dark:border-neutral-700 bg-white dark:bg-surface-01dp hover:bg-gray-100 dark:hover:bg-surface-02dp hover:border-gray-300 dark:hover:border-neutral-700"
      )}
      onClick={onClick}
    >
      <Icon
        className={classNames(
          "w-8 h-8",
          active
            ? "text-primary"
            : "text-gray-600 dark:text-neutral-400"
        )}
      />
      <h3
        className={classNames(
          "font-medium leading-6",
          active ? "text-gray-900 dark:text-white" : "text-gray-800 dark:text-neutral-200"
        )}
      >
        {title}
      </h3>
      <p
        className={classNames(
          "text-sm leading-5",
          active ? "text-gray-700 dark:text-neutral-300" : "text-gray-600 dark:text-neutral-400"
        )}
      >
        {description}
      </p>
    </button>
  );
}
