import { NavLink } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  end?: boolean;
  href: string;
};

function NavbarLink({ children, end = false, href }: Props) {
  return (
    <NavLink
      end={end}
      to={href}
      className={({ isActive }) =>
        "block px-1 font-semibold transition-colors duration-200" +
        (isActive
          ? " text-orange-bitcoin hover:text-orange-bitcoin dark:text-orange-bitcoin"
          : " text-gray-600 dark:text-gray-400 hover:text-gray-700")
      }
    >
      {children}
    </NavLink>
  );
}

export default NavbarLink;
