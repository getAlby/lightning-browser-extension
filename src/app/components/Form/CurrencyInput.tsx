import React from "react";

function CurrencyInput({
  onChange,
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-500 sm:text-sm">$</span>
      </div>
      <input
        type="text"
        name="price"
        id="price"
        className="focus:ring-orange-bitcoin focus:border-orange-bitcoin block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
        placeholder="0.00"
        onChange={onChange}
      />
      <div className="absolute inset-y-0 right-0 flex items-center">
        <label htmlFor="currency" className="sr-only">
          Currency
        </label>
        <select
          id="currency"
          name="currency"
          className="focus:ring-orange-bitcoin focus:border-orange-bitcoin h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
        >
          <option>USD</option>
          <option>EUR</option>
          <option>BTC</option>
        </select>
      </div>
    </div>
  );
}

export default CurrencyInput;
