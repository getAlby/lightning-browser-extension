import { FC } from "react";

export type Props = {
  amount: string | React.ReactNode;
  amountAlt?: string;
  description?: string | React.ReactNode;
  fiatAmount: string;
};

const PaymentSummary: FC<Props> = ({
  amount,
  amountAlt,
  description,
  fiatAmount,
}) => {
  return (
    <dl className="mb-0">
      <dt className="font-medium dark:text-white">Amount</dt>
      <dd className="text-gray-500 dark:text-neutral-400">
        {amount} sats
        {!!fiatAmount && (
          <span className="text-gray-400" data-testid="fiat_amount">
            {" "}
            (~{fiatAmount})
          </span>
        )}
      </dd>
      {amountAlt && <dd className="text-gray-400">{amountAlt}</dd>}
      {!!description && (
        <>
          <dt className="mt-4 font-medium dark:text-white">Description</dt>
          <dd className="text-gray-500 dark:text-neutral-400 break-all">
            {description}
          </dd>
        </>
      )}
    </dl>
  );
};

export default PaymentSummary;
