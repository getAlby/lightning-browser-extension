import { FunctionComponent, SVGProps } from "react";

export type Props = {
  title: string;
  description: string;
  icon: IconType;
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
  onClick,
}: Props) {
  return (
    <button
      className="flex flex-col flex-1 text-left border border-gray-200 dark:border-neutral-700 rounded-xl p-6 bg-white dark:bg-surface-01dp hover:bg-gray-100 dark:hover:bg-surface-02dp hover:border-gray-300 dark:hover:border-neutral-700 focus:bg-amber-50 dark:focus:bg-surface-02dp cursor-pointer focus:ring-primary focus:border-primary dark:focus:border-primary focus:ring-1 gap-2"
      onClick={onClick}
    >
      <Icon className="w-8 h-8 text-gray-700 dark:text-white" />
      <h3 className="font-medium leading-6 text-sm text-gray-800 dark:text-neutral-200">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-neutral-400 text-xs leading-5">
        {description}
      </p>
    </button>
  );
}
