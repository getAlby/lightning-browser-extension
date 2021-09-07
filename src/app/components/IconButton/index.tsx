import React from "react";

function IconButton({ onClick, icon }) {
  return (
    <button
      className="flex justify-center items-center w-8 h-8 bg-gray-50 rounded-md border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-colors duration-200"
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

export default IconButton;
