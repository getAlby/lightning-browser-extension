import { NavLink } from "react-router-dom";
import { classNames } from "~/app/utils";

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
        classNames(
          "block font-semibold px-1 text-md transition-colors duration-200 hover:text-orange-bitcoin dark:hover:text-orange-bitcoin",
          isActive
            ? " text-gray-900 dark:text-gray-100"
            : " text-gray-400 dark:text-gray-400"
        )
      }
    >
      {children}
    </NavLink>
  );
}

export default NavbarLink;
