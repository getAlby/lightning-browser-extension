import React from "react";

function Select({ children, value, name, onChange }) {
  return (
    <select
      className="w-full h-14 border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
      name={name}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  );
}

export default Select;
