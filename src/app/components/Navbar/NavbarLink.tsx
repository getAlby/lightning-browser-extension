import React from "react";
import { NavLink } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  exact?: boolean;
  href: string;
};

function NavbarLink({ children, exact = false, href }: Props) {
  return (
    <NavLink
      exact={exact}
      to={href}
      className="block text-gray-500 hover:text-gray-700 px-1 font-semibold transition-color duration-200"
      activeClassName="text-orange-bitcoin hover:text-orange-bitcoin"
    >
      {children}
    </NavLink>
  );
}

export default NavbarLink;
