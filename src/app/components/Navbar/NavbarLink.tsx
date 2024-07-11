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
          "flex items-center font-semibold hover:text-gray-600 dark:hover:text-neutral-400 transition px-1 text-md",
          isActive
            ? "text-gray-800 dark:text-neutral-200"
            : "text-gray-400 dark:text-neutral-600"
        )
      }
    >
      {children}
    </NavLink>
  );
}

export default NavbarLink;
