import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";

import Button from "../Button";

type Props = {
  onClick: (amount: string) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
};

function stringifyThousands(number: number) {
  return number < 1000
    ? `${Math.round(number)}`
    : number < 1_000_000
    ? `${Math.floor(number / 1000)}K`
    : `${Math.floor(number / 1_000_000)}M`;
}

function tensRounder(number: number, index: number) {
  const rounded = Math.round(number);
  const tens = Math.round(Math.log(rounded) * Math.LOG10E) - 1;
  const integralFunction = index === 0 ? Math.ceil : Math.trunc;
  return integralFunction(rounded / Math.pow(10, tens)) * Math.pow(10, tens);
}

function amountsArray(min: number, max: number) {
  let safeMin = Math.max(Math.ceil(min), 100);
  const safeMax = Math.min(Math.floor(max), 100_000_000);
  if (safeMin >= safeMax) {
    safeMin = Math.ceil(min);
  }
  const distance = Math.round(
    Math.log(Math.round(safeMax / safeMin)) * Math.LOG10E
  ); // we define the distance as the number of tens of the ratio
  if (distance >= 3) {
    const factor = Math.pow(10, distance - 3);
    return distance % 2 === 0
      ? [safeMin, factor * 50 * safeMin, factor * 100 * safeMin, safeMax].map(
          (x, index) => tensRounder(x, index)
        )
      : [safeMin, factor * 10 * safeMin, factor * 100 * safeMin, safeMax].map(
          (x, index) => tensRounder(x, index)
        );
  } else if (distance === 2) {
    return [safeMin, 5 * safeMin, 10 * safeMin, safeMax].map((x, index) =>
      tensRounder(x, index)
    );
  } else {
    return [safeMin, (safeMin + safeMax) / 2, safeMax].map((x, index) =>
      tensRounder(x, index)
    );
  }
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
