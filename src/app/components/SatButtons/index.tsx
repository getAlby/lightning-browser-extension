import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";

import Button from "../Button";

type Props = {
  onClick: (amount: string) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
};

function SatButtons({ onClick, disabled, min, max }: Props) {
  let sizes;

  const round = (num: number) => {
    return Math.round(num * 10) / 10;
  };

  // round & format: 1M, 1k, 100
  const format = (num: number, pos: number): { t: string; n: number } => {
    for (let i = 1e6; i > 1; i /= 1e3) {
      if (num >= i) {
        const n = round(num / i);
        const unit = i === 1e3 ? "k" : "M";
        return {
          // text
          t: n + unit,
          // number
          n: pos === 1 || pos === 2 ? n * i : num,
        };
      }
    }
    return {
      t: num + "",
      n: num,
    };
  };

  if (typeof min === "number" && typeof max === "number" && min < max) {
    const range = max - min;
    const step = range / 3;
    sizes = [min, step + min, range - step + min, max];
  } else {
    sizes = [1000, 5000, 10000, 25000];
  }

  return (
    <div className="flex gap-2">
      {sizes.map(format).map((size) => (
        <Button
          key={size.t}
          icon={<SatoshiV2Icon className="w-4 h-4" />}
          label={size.t}
          onClick={() => onClick(size.n.toString())}
          disabled={disabled}
          fullWidth
        />
      ))}
    </div>
  );
}

export default SatButtons;
