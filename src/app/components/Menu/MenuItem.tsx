import React from "react";
import { MenuItem } from "@reach/menu-button";
import "./MenuItem.css";

type Props = {
  children: React.ReactNode;
  onClick: () => void;
};

function MenuItemComponent({ children, onClick }: Props) {
  return (
    <MenuItem
      className="flex items-center cursor-pointer text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
      onSelect={onClick}
    >
      {children}
    </MenuItem>
  );
}

export default MenuItemComponent;
