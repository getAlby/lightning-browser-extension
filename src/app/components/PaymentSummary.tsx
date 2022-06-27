type Props = {
  amount: string | React.ReactNode;
  amountAlt?: string;
  description?: string | React.ReactNode;
};

function PaymentSummary({ amount, amountAlt, description }: Props) {
  return (
    <dl className="mb-0">
      <dt className="font-medium text-gray-800 dark:text-white">Amount</dt>
      <dd className="mb-0 text-gray-600 dark:text-neutral-500">
        {amount} sats
      </dd>
      {amountAlt && <dd className="text-gray-500">{amountAlt}</dd>}
      <dt className="mt-4 font-medium text-gray-800 dark:text-white">
        Description
      </dt>
      <dd className="mb-0 text-gray-600 dark:text-neutral-500 break-all">
        {description}
      </dd>
    </dl>
  );
}

export default PaymentSummary;
