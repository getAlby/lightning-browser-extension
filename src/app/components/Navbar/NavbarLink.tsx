import { NavLink } from "react-router-dom";
import { classNames } from "~/app/utils";

type Props = {
  children: React.ReactNode;
  end?: boolean;
  href: string;
  target?: string;
};

function NavbarLink({ children, end = false, href, target }: Props) {
  return (
    <NavLink
      end={end}
      to={href}
      target={target}
      className={({ isActive }) =>
        classNames(
          "inline-flex font-semibold hover:text-gray-800 dark:hover:text-gray-300 transition px-1 text-md",
          isActive
            ? " text-black dark:text-gray-100"
            : " text-gray-600 dark:text-gray-600"
        )
      }
    >
      {children}
    </NavLink>
  );
}

export default NavbarLink;
