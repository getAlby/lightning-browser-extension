import { NavLink } from "react-router-dom";
import { classNames } from "~/app/utils";

type Props = {
  children: React.ReactNode;
  end?: boolean;
  href: string;
  target?: "_blank";
};

function NavbarLink({ children, end = false, href, target }: Props) {
  return (
    <NavLink
      end={end}
      to={href}
      target={target}
      className={({ isActive }) =>
        classNames(
          "block font-semibold hover:text-gray-600 dark:hover:text-gray-300 transition px-1 text-md",
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
