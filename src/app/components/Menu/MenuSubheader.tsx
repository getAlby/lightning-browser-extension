import React from "react";

function MenuSubheader({ children }: { children: string }) {
  return (
    <span className="select-none px-4 text-gray-500 text-xxs font-medium uppercase">
      {children}
    </span>
  );
}

export default MenuSubheader;
