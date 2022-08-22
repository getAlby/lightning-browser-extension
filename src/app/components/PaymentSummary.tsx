type Props = {
  amount: string | React.ReactNode;
  amountAlt?: string;
  description?: string | React.ReactNode;
  fiatAmount: string;
};

function PaymentSummary({ amount, amountAlt, description, fiatAmount }: Props) {
  return (
    <dl className="mb-0">
      <dt className="font-medium dark:text-white">Amount (Satoshi)</dt>
      <dd className="text-gray-500 dark:text-neutral-400">{amount} sats</dd>
      {amountAlt && <dd className="text-gray-400">{amountAlt}</dd>}
      {!!fiatAmount && (
        <>
          <dt className="mt-4 font-medium dark:text-white">Amount (Fiats)</dt>
          <dd className="text-gray-500 dark:text-neutral-400">~{fiatAmount}</dd>
        </>
      )}
      <dt className="mt-4 font-medium dark:text-white">Description</dt>
      <dd className="text-gray-500 dark:text-neutral-400 break-all">
        {description}
      </dd>
    </dl>
  );
}

export default PaymentSummary;
