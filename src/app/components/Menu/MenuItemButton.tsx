import { Menu } from "@headlessui/react";

type Props = {
  children: React.ReactNode;
  onClick: () => void;
};

function MenuItemButton({ children, onClick }: Props) {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          className={`${
            active ? "bg-gray-100" : ""
          } flex items-center cursor-pointer text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600`}
          onClick={onClick}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  );
}

export default MenuItemButton;
