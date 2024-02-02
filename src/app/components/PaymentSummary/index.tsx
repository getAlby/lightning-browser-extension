import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "~/app/context/SettingsContext";

export type Props = {
  amount: string | number;
  description?: string | React.ReactNode;
  fiatAmount: string;
};

const PaymentSummary: FC<Props> = ({ amount, description, fiatAmount }) => {
  const { t: tCommon } = useTranslation("common");
  const { getFormattedSats } = useSettings();

  return (
    <dl className="space-y-4">
      <div>
        <Dt>{tCommon("amount")}</Dt>
        <Dd>
          <div className="flex flex-row justify-between">
            <div>{getFormattedSats(amount)}</div>
            {!!fiatAmount && (
              <span data-testid="fiat_amount">~{fiatAmount}</span>
            )}
          </div>
        </Dd>
      </div>
      {!!description && (
        <div>
          <Dt>{tCommon("description")}</Dt>
          <Dd>{description}</Dd>
        </div>
      )}
    </dl>
  );
};

const Dt = ({ children }: { children: React.ReactNode }) => (
  <dt className="text-sm font-medium text-gray-800 dark:text-neutral-200">
    {children}
  </dt>
);

const Dd = ({ children }: { children: React.ReactNode }) => (
  <dd className="text-lg text-gray-600 dark:text-neutral-400 break-words">
    {children}
  </dd>
);

export default PaymentSummary;
