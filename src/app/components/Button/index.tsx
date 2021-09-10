import React from "react";

import { classNames } from "../../utils/index";

import Loading from "../Loading";

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
        primary
          ? "bg-orange-bitcoin text-white border border-transparent hover:opacity-90"
          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100",
        "inline-flex justify-center items-center px-7 py-2 font-medium rounded-md shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-bitcoin transition-colors duration-200"
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
