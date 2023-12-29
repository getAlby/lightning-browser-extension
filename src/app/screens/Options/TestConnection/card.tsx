import { useTranslation } from "react-i18next";

type Props = {
  alias: string;
  accountName: string;
  satoshis: string;
  fiat?: string;
  color: string;
  currency?: string;
};

export default function TestConnectionResultCard({
  alias,
  accountName,
  satoshis,
  fiat,
  color,
  currency,
}: Props) {
  const { t } = useTranslation("translation", {
    keyPrefix: "welcome.test_connection",
  });
  return (
    <div className={`${color} rounded-lg py-6 dark:bg-gray-600`}>
      <p className="font-normal text-black ml-6 dark:text-white break-words">
        {t("account_name", { accountName })}
      </p>
      <p className="font-normal text-black ml-6 dark:text-white">
        {t("alias", { alias })}
      </p>
      <p className="text-2xl font-bold text-black ml-6 mt-2 dark:text-white">
        {satoshis}
      </p>
      {fiat && currency && (
        <p className="font-normal text-white ml-6 mt-1">
          {fiat} {currency}
        </p>
      )}
    </div>
  );
}
