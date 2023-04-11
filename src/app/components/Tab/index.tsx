import { Tab } from "@headlessui/react";
import { classNames } from "~/app/utils/index";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active: boolean;
  icon?: React.ReactNode;
  leftTab?: boolean;
  rightTab?: boolean;
  label?: string;
};

export default function TabComponent({
  active,
  icon,
  onClick,
  label,
  leftTab = false,
  rightTab = false,
}: Props) {
  return (
    <Tab
      onClick={onClick}
      className={classNames(
        "font-bold text-lg  gap-[6px] inline-flex px-2 flex-1 py-2 justify-center items-center rounded-md shadow focus:outline-none  transition duration-150",
        active
          ? `text-gray-700 h-10 drop-shadow-xl dark:text-neutral-200 bg-white dark:bg-surface-16dp `
          : `text-gray-500 h-9 dark:text-neutral-500 hover:text-gray-700 hover:bg-gray-200 bg-gray-100 dark:bg-surface-02dp `,
        !active && leftTab && " rounded-tr-none rounded-br-none  ",
        !active && rightTab && " rounded-tl-none rounded-bl-none ",
        active && leftTab && " z-20 translate-x-1",
        active && rightTab && " z-20 translate-x-[-4px]"
      )}
    >
      {icon}
      {label}
    </Tab>
  );
}
