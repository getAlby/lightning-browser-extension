import { ReactNode } from "react";

type Props = {
  onClick: () => void;
  children: ReactNode;
};

export default function Hyperlink({ onClick, children }: Props) {
  return (
    <a
      className="cursor-pointer text-sky-500 hover:text-sky-400"
      onClick={onClick}
    >
      {children}
    </a>
  );
}
