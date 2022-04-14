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
        "block text-gray-500 hover:text-gray-700 px-1 font-semibold transition-colors duration-200 dark:text-gray-400" +
        (isActive
          ? " text-orange-bitcoin hover:text-orange-bitcoin dark:text-orange-bitcoin"
          : "")
      }
    >
      {children}
    </NavLink>
  );
}

export default NavbarLink;
