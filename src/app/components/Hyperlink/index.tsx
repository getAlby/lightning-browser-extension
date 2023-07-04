import { ReactNode } from "react";
import { classNames } from "~/app/utils";

type Props = {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  target?: "_blank" | undefined;
};

export default function Hyperlink({
  onClick,
  children,
  href,
  className,
  target,
}: Props) {
  return (
    <a
      className={classNames(
        "cursor-pointer text-blue-600 hover:text-blue-700",
        className ?? ""
      )}
      href={href}
      onClick={onClick}
      target={target}
    >
      {children}
    </a>
  );
}
