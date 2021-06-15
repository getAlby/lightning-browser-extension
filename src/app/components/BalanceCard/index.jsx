import React from "react";

export default function Card({ alias, crypto, fiat }) {
  return (
    <div className={`bg-blue-bitcoin p-6 pb-2 rounded-2xl shadow-lg`}>
      <p className="text-sm	font-normal text-white">{alias}</p>
      <p className="text-2xl font-medium text-white mt-2 mb-0">{crypto}</p>
      <p className="text-sm font-normal text-white mt-1 mb-0">{fiat}</p>
    </div>
  );
}
