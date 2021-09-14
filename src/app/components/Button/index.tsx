import React from "react";

import { classNames } from "../../utils/index";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  label: string;
  primary?: boolean;
};

export default function Button({
  type = "button",
  label,
  onClick,
  fullWidth = false,
  primary = false,
}: Props) {
  return (
    <button
      type={type}
      className={classNames(
        fullWidth ? "w-full" : "",
        primary
          ? "bg-orange-bitcoin text-white border border-transparent hover:opacity-90"
          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100",
        "inline-flex justify-center items-center px-7 py-2 font-medium rounded-md shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-bitcoin transition-colors duration-200"
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
