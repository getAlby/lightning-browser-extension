import { Menu } from "@headlessui/react";
import { classNames } from "~/app/utils/index";

type Props = {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
};

function MenuItemButton({
  children,
  disabled = false,
  onClick,
  title = "",
}: Props) {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          className={classNames(
            active ? "bg-gray-50 dark:bg-surface-02dp" : "",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            "flex items-center w-full p-4 text-sm text-gray-800 dark:text-neutral-200 whitespace-nowrap"
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
