import React from "react";

export default function Badge({ label, color, textColor, small }) {
  return (
    <span
      className={`inline-block leading-none rounded font-medium bg-${color} text-${textColor} ${
        !small ? "p-1.5 text-xs" : "p-1 text-xxs"
      }`}
    >
      {label}
    </span>
  );
}
