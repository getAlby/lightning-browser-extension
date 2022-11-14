import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "~/app/context/SettingsContext";
import { getSatValue } from "~/common/utils/currencyConvert";

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
  const { settings } = useSettings();

  return (
    <dl className="mb-0">
      <dt className="font-medium dark:text-white">{tCommon("amount")}</dt>
      <dd className="text-gray-500 dark:text-neutral-400">
        {getSatValue({ amount, locale: settings.locale })}
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
          <dt className="mt-4 font-medium dark:text-white">
            {tCommon("description")}
          </dt>
          <dd className="text-gray-500 dark:text-neutral-400 break-all">
            {description}
          </dd>
        </>
      )}
    </dl>
  );
};

export default PaymentSummary;
