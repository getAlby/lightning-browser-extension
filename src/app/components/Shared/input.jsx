import React from "react";

export default function Input({name, id, placeholder}) {
  return (
    <input
      type="text"
      name={name}
      id={id}
      className="shadow-sm focus:ring-orange-bitcoin h-14 focus:border-orange-bitcoin block w-full sm:text-sm border-gray-300 rounded-md"
      placeholder={placeholder}
    />
  );
}
