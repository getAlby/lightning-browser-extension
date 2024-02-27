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
  return (
    <div
      className={`${color} rounded-lg p-5 dark:bg-gray-600 text-black dark:text-white`}
    >
      <p className="break-words">{accountName}</p>
      <p className="text-xs break-words">{alias}</p>
      <p className="text-2xl font-bold mt-2">{satoshis}</p>
      {fiat && currency && (
        <p className="text-white mt-1">
          {fiat} {currency}
        </p>
      )}
    </div>
  );
}
