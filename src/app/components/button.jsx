import React from "react";

export default function Button({
  type = "button",
  label,
  onClick,
  fullWidth = false,
}) {
  return (
    <button
      type={type}
      className={`inline-flex justify-center items-center px-7 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-bitcoin hover:bg-hover-orange-bitcoin focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hover-orange-bitcoin ${
        fullWidth ? "w-full" : ""
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
