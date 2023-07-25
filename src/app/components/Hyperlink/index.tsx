import { ReactNode } from "react";
import { classNames } from "~/app/utils";

type Props = {
  href?: string;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
  target?: "_blank" | undefined;
  rel?: string;
};

export default function Hyperlink({
  onClick,
  children,
  href,
  className,
  target,
  rel,
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
      rel={rel}
    >
      {children}
    </a>
  );
}
