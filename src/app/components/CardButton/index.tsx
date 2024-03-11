import React, { FunctionComponent, SVGProps } from "react";

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
  icon,
  onClick,
}: Props) {
  return (
    <div
      className="flex flex-col gap-2 p-5 hover:bg-gray-50 dark:hover:bg-surface-08dp rounded-md border border-gray-200 dark:border-neutral-700 hover:border-gray-300 hover:dark:border-neutral-800 cursor-pointer"
      onClick={onClick}
    >
      {React.createElement(icon, {
        className: "w-8 h-8 text-gray-700 dark:text-white",
      })}
      <h3 className="font-medium text-gray-700 dark:text-neutral-200">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-neutral-500">{description}</p>
    </div>
  );
}
