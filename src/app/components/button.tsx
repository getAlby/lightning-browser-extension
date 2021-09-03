import React from "react";

import { classNames } from "../utils/index";

import Loading from "./Loading";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  label: string;
  primary?: boolean;
  loading?: boolean;
};

export default function Button({
  type = "button",
  label,
  onClick,
  fullWidth = false,
  primary = false,
  loading = false,
}: Props) {
  return (
    <button
      type={type}
      className={classNames(
        fullWidth ? "w-full" : "",
        primary ? "bg-orange-bitcoin" : "bg-gray-100 text-gray-700",
        "inline-flex justify-center items-center px-7 py-2 border border-transparent font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
      )}
      onClick={onClick}
    >
      {loading && (
        <div className="mr-2">
          <Loading color="white" />
        </div>
      )}
      {label}
    </button>
  );
}
