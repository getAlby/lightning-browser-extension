import React from "react";

export default function Badge({ label, color, textColor }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-${color} text-${textColor}`}
    >
      {label}
    </span>
  );
}
