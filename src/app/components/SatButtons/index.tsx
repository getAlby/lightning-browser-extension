import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";

import Button from "../Button";

type Props = {
  onClick: (amount: string) => void;
  disabled?: boolean;
};

function SatButtons({ onClick, disabled }: Props) {
  return (
    <div className="flex gap-2">
      <Button
        icon={<SatoshiV2Icon className="w-4 h-4" />}
        label="1k ⚡"
        onClick={() => onClick("1000")}
        fullWidth
        disabled={disabled}
      />
      <Button
        icon={<SatoshiV2Icon className="w-4 h-4" />}
        label="5k ⚡"
        onClick={() => onClick("5000")}
        fullWidth
        disabled={disabled}
      />
      <Button
        icon={<SatoshiV2Icon className="w-4 h-4" />}
        label="10k ⚡"
        onClick={() => onClick("10000")}
        fullWidth
        disabled={disabled}
      />
      <Button
        icon={<SatoshiV2Icon className="w-4 h-4" />}
        label="25k ⚡"
        onClick={() => onClick("25000")}
        fullWidth
        disabled={disabled}
      />
    </div>
  );
}

export default SatButtons;
