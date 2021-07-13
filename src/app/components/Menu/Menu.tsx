import React from "react";
import { Menu } from "@reach/menu-button";

type Props = {
  children: React.ReactNode;
};

function MenuComponent({ children }: Props) {
  return <Menu>{children}</Menu>;
}

export default MenuComponent;
