import React from "react";

export default function Card({ topLabel, lastLabel, heading }) {
  return (
    <div className="bg-red-bitcoin h-36 rounded-lg mt-5 pt-6">
      <p className="text-base	font-normal text-white ml-6">{topLabel}</p>
      <p className="text-2xl font-medium text-white ml-6 mt-2">{heading}</p>
      <p className="text-base font-normal text-white ml-6 mt-1">{lastLabel}</p>
    </div>
  );
}
