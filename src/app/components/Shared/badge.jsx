import React from "react";

export default function Badge({ label, color, textColor }) {
  return (
    <span
      className={`px-1.5 py-1 rounded text-xs font-medium bg-${color} text-${textColor}`}
    >
      {label}
    </span>
  );
}
