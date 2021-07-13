import React from "react";
import { MenuButton } from "@reach/menu-button";

type Props = {
  children: React.ReactNode;
};

function Button({ children }: Props) {
  return (
    <MenuButton className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
      {children}
    </MenuButton>
  );
}

export default Button;
