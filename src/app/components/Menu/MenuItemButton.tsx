import { CheckIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { Menu } from "@headlessui/react";
import { classNames } from "~/app/utils/index";

type Props = {
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
  selected?: boolean;
};

function MenuItemButton({
  children,
  danger = false,
  disabled = false,
  onClick,
  title = "",
  selected = false,
}: Props) {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          className={classNames(
            active ? "bg-gray-100 dark:bg-white/10" : "",
            danger ? "text-red-700" : "text-gray-700",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            "flex items-center block w-full text-left px-4 py-2 text-sm dark:text-white"
          )}
          disabled={disabled}
          onClick={onClick}
          title={title}
        >
          {children}
          {selected && (
            <span className="ml-auto w-3.5 h-3.5 rounded-full bg-orange-bitcoin flex justify-center items-center">
              <CheckIcon className="w-3 h-3 text-white" />
            </span>
          )}
        </button>
      )}
    </Menu.Item>
  );
}

export default MenuItemButton;
