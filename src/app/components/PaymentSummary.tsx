type Props = {
  amount: string | React.ReactNode;
  amountAlt?: string;
  description?: string | React.ReactNode;
};

function PaymentSummary({ amount, amountAlt, description }: Props) {
  return (
    <div className="p-4 shadow bg-white rounded-lg dark:bg-gray-700">
      <dl className="mb-0">
        <dt className="uppercase font-semibold text-gray-500 text-xs">
          Amount
        </dt>
        <dd className="mb-0 dark:text-white">{amount}</dd>
        {amountAlt && <dd className="text-gray-500">{amountAlt}</dd>}
        <dt className="mt-4 uppercase font-semibold text-gray-500 text-xs">
          Description
        </dt>
        <dd className="mb-0 dark:text-white break-all">{description}</dd>
      </dl>
    </div>
  );
}

export default PaymentSummary;
