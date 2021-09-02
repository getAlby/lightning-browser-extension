import React from "react";

import { classNames } from "../utils/index";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  fullWidth?: boolean;
  label: string;
  primary?: boolean;
};

export default function Button({
  href,
  type = "button",
  label,
  onClick,
  fullWidth = false,
  primary = false,
}: Props) {
  const classes = classNames(
    fullWidth ? "w-full" : "",
    primary ? "bg-orange-bitcoin" : "bg-gray-100 text-gray-700",
    "inline-flex justify-center items-center px-7 py-2 border border-transparent font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
  );

  if (href) {
    return (
      <a className={classes} href={href}>
        {label}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {label}
    </button>
  );
}
