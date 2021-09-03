import React from "react";
import { MenuList } from "@reach/menu-button";

type Props = {
  children: React.ReactNode;
};

function List({ children }: Props) {
  return (
    <MenuList className="mt-2 py-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
      {children}
    </MenuList>
  );
}

export default List;
