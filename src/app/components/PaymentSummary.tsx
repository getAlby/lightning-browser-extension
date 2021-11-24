import React from "react";

type Props = {
  amount: string;
  amountAlt?: string;
  description: string;
};

function PaymentSummary({ amount, amountAlt, description }: Props) {
  return (
    <div className="p-4 bg-gray-50 border-t border-b border-gray-200 rounded-lg dark:bg-gray-200">
      <dl className="mb-0">
        <dt className="uppercase font-semibold text-gray-500 text-xs">
          Amount
        </dt>
        <dd className="mb-0">{amount} sat</dd>
        {amountAlt && <dd className="text-gray-500">{amountAlt} sat</dd>}
        <dt className="mt-4 uppercase font-semibold text-gray-500 text-xs">
          Description
        </dt>
        <dd className="mb-0">{description}</dd>
      </dl>
    </div>
  );
}

export default PaymentSummary;
