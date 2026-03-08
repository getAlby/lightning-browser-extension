import { FunctionComponent, SVGProps } from "react";
import { clsx } from "clsx";

export type Props = {
  title: string;
  description: string;
  icon: IconType;
  active?: boolean;
  onClick: () => void;
};

interface IconTypeProps {
  className?: string;
}

type IconType = FunctionComponent<IconTypeProps & SVGProps<SVGSVGElement>>;

export default function CardButton({
  title,
  description,
  icon: Icon,
  active,
  onClick,
}: Props) {
  return (
    <button
      className={clsx(
        "flex flex-col flex-1 text-left border rounded-xl p-6 bg-white dark:bg-surface-01dp hover:bg-gray-100 dark:hover:bg-surface-02dp hover:border-gray-300 dark:hover:border-neutral-700 focus:bg-amber-50 dark:focus:bg-surface-02dp cursor-pointer focus:ring-primary focus:border-primary dark:focus:border-primary focus:ring-1 gap-2 transition-all",
        active
          ? "border-primary ring-1 ring-primary bg-amber-50 dark:bg-surface-02dp"
          : "border-gray-200 dark:border-neutral-700"
      )}
      onClick={onClick}
    >
      <Icon
        className={clsx(
          "w-8 h-8",
          active ? "text-primary" : "text-gray-600 dark:text-neutral-400"
        )}
      />
      <h3
        className={clsx(
          "font-medium leading-6",
          active ? "text-gray-900" : "text-gray-800 dark:text-neutral-200"
        )}
      >
        {title}
      </h3>
      <p className="text-gray-600 dark:text-neutral-400 text-sm leading-5">
        {description}
      </p>
    </button>
  );
}
