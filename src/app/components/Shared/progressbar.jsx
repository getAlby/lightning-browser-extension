import React from "react";

export default function Progressbar({
  filledColor,
  notFilledColor,
  percentage,
}) {
  return (
    <>
      <div>
        <div className="flex items-center justify-between mt-0">
          <div className="text-right"></div>
        </div>
        <div className={`overflow-hidden h-1.5 mb-4 text-xs flex rounded-lg`}>
          <div
            className={`w-full shadow-none flex flex-col text-center text-white justify-center bg-${filledColor}`}
          ></div>
        </div>
      </div>
    </>
  );
}
