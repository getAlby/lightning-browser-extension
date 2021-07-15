import React from "react";

export default function Card({ alias, satoshis, fiat, color, currency }) {
  return (
    <div className={`bg-${color} h-36 rounded-lg pt-6`}>
      <p className="font-normal text-white ml-6">{alias}</p>
      <p className="text-2xl font-medium text-white ml-6 mt-2">{satoshis}</p>
      <p className="font-normal text-white ml-6 mt-1">
        {fiat} {currency}
      </p>
    </div>
  );
}
