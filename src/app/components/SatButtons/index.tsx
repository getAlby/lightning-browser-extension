import Button from "../Button";
import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";

type Props = {
  onClick: (amount: string) => void;
};

function SatButtons({ onClick }: Props) {
  return (
    <div className="flex gap-2 mt-2 text-sm">
      <Button
        icon={<SatoshiV2Icon className="w-4 h-4" />}
        label="100 ⚡"
        onClick={() => onClick("100")}
        fullWidth
        compact
      />
      <Button
        icon={<SatoshiV2Icon className="w-4 h-4" />}
        label="1K ⚡"
        onClick={() => onClick("1000")}
        fullWidth
        compact
      />
      <Button
        icon={<SatoshiV2Icon className="w-4 h-4" />}
        label="5K ⚡"
        onClick={() => onClick("5000")}
        fullWidth
        compact
      />
      <Button
        icon={<SatoshiV2Icon className="w-4 h-4" />}
        label="10K ⚡"
        onClick={() => onClick("10000")}
        fullWidth
        compact
      />
    </div>
  );
}

export default SatButtons;
