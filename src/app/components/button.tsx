import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  label: string;
};

export default function Button({
  type = "button",
  label,
  onClick,
  fullWidth = false,
}: Props) {
  return (
    <button
      type={type}
      className={`inline-flex justify-center items-center px-7 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-orange-bitcoin hover:bg-hover-orange-bitcoin focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hover-orange-bitcoin ${
        fullWidth ? "w-full" : ""
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
