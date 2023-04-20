import { Tab as HeadlessUiTab } from "@headlessui/react";
import { classNames } from "~/app/utils/index";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
  label?: string;
};

export function Tab({ icon, onClick, label, className }: Props) {
  return (
    <HeadlessUiTab
      onClick={onClick}
      className={({ selected }) =>
        classNames(
          "font-bold text-lg  gap-[6px] inline-flex px-2 flex-1 py-2 justify-center items-center rounded-md",
          "shadow focus:outline-none  transition duration-150",
          selected
            ? ` text-gray-700 h-10 drop-shadow-xl dark:text-neutral-200 bg-white dark:bg-surface-16dp z-20 first:translate-x-1 last:translate-x-[-4px] `
            : `text-gray-500 h-9 dark:text-neutral-500 hover:text-gray-700 hover:bg-gray-200 bg-gray-100 dark:bg-surface-02dp dark:hover:text-gray-300`,
          !!className && className
        )
      }
    >
      {icon}
      {label}
    </HeadlessUiTab>
  );
}
