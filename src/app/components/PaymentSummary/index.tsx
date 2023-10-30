import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "~/app/context/SettingsContext";

export type Props = {
  amount: string | number;
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
  const { t: tCommon } = useTranslation("common");
  const { getFormattedSats } = useSettings();

  return (
    <dl className="mb-0">
      <dt className="text-sm text-gray-500 dark:text-neutral-500">
        {tCommon("amount")}
      </dt>
      <dd className="text-lg text-gray-700 dark:text-neutral-200 flex flex-row justify-between">
        <div>{getFormattedSats(amount)}</div>
        {!!fiatAmount && (
          <span
            className="text-gray-500 dark:text-neutral-500"
            data-testid="fiat_amount"
          >
            {" "}
            (~{fiatAmount})
          </span>
        )}
      </dd>
      {amountAlt && <dd className="text-gray-400">{amountAlt}</dd>}
      {!!description && (
        <>
          <dt className="mt-4 font-medium dark:text-white">
            {tCommon("description")}
          </dt>
          <dd className="text-gray-500 dark:text-neutral-400 break-words whitespace-pre-wrap overflow-y-auto max-h-36">
            {description}
          </dd>
        </>
      )}
    </dl>
  );
};

export default PaymentSummary;
