import { Menu } from "@headlessui/react";
import { classNames } from "~/app/utils/index";

type Props = {
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
};

function MenuItemButton({
  children,
  danger = false,
  disabled = false,
  onClick,
  title = "",
}: Props) {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          className={classNames(
            active ? "bg-gray-50 dark:bg-white/10" : "",
            danger ? "text-red-700" : "text-gray-700",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            "flex items-center block w-full text-left p-4 text-sm dark:text-white"
          )}
          disabled={disabled}
          onClick={onClick}
          title={title}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  );
}

export default MenuItemButton;
