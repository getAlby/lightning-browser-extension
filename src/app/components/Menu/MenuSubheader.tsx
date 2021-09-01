import React from "react";

function MenuSubheader({ children }: { children: string }) {
  return (
    <span className="select-none px-4 text-gray-400 text-xs font-medium uppercase">
      {children}
    </span>
  );
}

export default MenuSubheader;
