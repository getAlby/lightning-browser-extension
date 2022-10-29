import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";

import Button from "../Button";

type Props = {
  onClick: (amount: string) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
};

function roundThousands(number: number) {
  return number < 1000 ? number : Math.floor(number / 1000) * 1000;
}

function stringifyThousands(number: number) {
  return number < 1000 ? `${number}` : `${Math.floor(number / 1000)}K`;
}

function amountsArray(min: number, max: number) {
  const distance = Math.min(max - min, 10000);
  const safeMin = max < 100 ? min : Math.max(min, 100);
  return [safeMin, min + distance / 10, min + distance / 2, min + distance];
}

function SatButtons({ onClick, disabled, min = 100, max = 10000 }: Props) {
  const amounts = amountsArray(min, max);
  return (
    <div className="flex gap-2 mt-2">
      <Button
        icon={<SatoshiV2Icon className="w-4 h-4" />}
        label={`${stringifyThousands(amounts[0])} ⚡`}
        onClick={() => onClick(`${roundThousands(amounts[0])}`)}
        fullWidth
        disabled={disabled}
      />
      <Button
        icon={<SatoshiV2Icon className="w-4 h-4" />}
        label={`${stringifyThousands(amounts[1])} ⚡`}
        onClick={() => onClick(`${roundThousands(amounts[1])}`)}
        fullWidth
        disabled={disabled}
      />
      <Button
        icon={<SatoshiV2Icon className="w-4 h-4" />}
        label={`${stringifyThousands(amounts[2])} ⚡`}
        onClick={() => onClick(`${roundThousands(amounts[2])}`)}
        fullWidth
        disabled={disabled}
      />
      <Button
        icon={<SatoshiV2Icon className="w-4 h-4" />}
        label={`${stringifyThousands(amounts[3])} ⚡`}
        onClick={() => onClick(`${roundThousands(amounts[3])}`)}
        fullWidth
        disabled={disabled}
      />
    </div>
  );
}

export default SatButtons;
