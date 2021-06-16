import React from "react";

export default function Button({ label }) {
  return (
    <button
      type="button"
      className="inline-flex items-center px-7 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-bitcoin hover:bg-hover-orange-bitcoin focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hover-orange-bitcoin"
    >
      {label}
    </button>
  );
}
