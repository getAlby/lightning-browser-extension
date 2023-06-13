import { Tab as HeadlessUiTab } from "@headlessui/react";
import React from "react";
import { classNames } from "~/app/utils/index";

type Props = {
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export function Tab({ icon, onClick, label, className, ...otherProps }: Props) {
  return (
    <HeadlessUiTab
      {...otherProps}
      onClick={onClick}
      className={({ selected }) =>
        classNames(
          "font-bold text-base gap-[6px] flex px-2 py-2 justify-center items-center rounded-md focus:outline-none transition duration-150 w-44 h-10",
          selected
            ? "text-gray-700 drop-shadow-md dark:text-neutral-200 bg-white dark:bg-surface-16dp"
            : "text-gray-500 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200",
          !!className && className
        )
      }
    >
      {icon}
      {label}
    </HeadlessUiTab>
  );
}
