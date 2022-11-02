import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";

import Button from "../Button";

type Props = {
  onClick: (amount: string) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
};

function roundThousands(number: number) {
  return number < 1000 ? Math.round(number) : Math.floor(number / 1000) * 1000;
}

function stringifyThousands(number: number) {
  return number < 1000
    ? `${Math.round(number)}`
    : `${Math.floor(number / 1000)}K`;
}

function amountsArray(min: number, max: number) {
  const distance = Math.min(max - min, 10000);
  const safeMin = max < 100 ? min : Math.max(min, 100);
  return [safeMin, min + distance / 10, min + distance / 2, min + distance].map(
    (amount) => roundThousands(amount)
  );
}

function SatButtons({ onClick, disabled, min = 100, max = 10000 }: Props) {
  // we use Set to dedup the array, useful if the min-max range is tight
  const amounts = [...new Set(amountsArray(min, max))];
  return (
    <div className="flex gap-2 mt-2">
      {amounts.map((amount, index) => (
        <Button
          key={index}
          icon={<SatoshiV2Icon className="w-4 h-4" />}
          label={`${stringifyThousands(amount)} ⚡`}
          onClick={() => onClick(`${amount}`)}
          fullWidth
          disabled={disabled}
        />
      ))}
    </div>
  );
}

export default SatButtons;
