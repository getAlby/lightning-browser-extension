import { Menu } from "@headlessui/react";

import { classNames } from "~/app/utils/index";

type Props = {
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function MenuItemButton({
  children,
  danger = false,
  disabled = false,
  onClick,
}: Props) {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          className={classNames(
            active ? "bg-gray-100" : "",
            danger ? "text-red-700" : "text-gray-700",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            "flex items-center block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
          )}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  );
}

export default MenuItemButton;
