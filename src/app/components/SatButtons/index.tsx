import SatoshiIcon from "~/app/icons/SatoshiIcon";
import Button from "../Button";

type Props = {
  onClick: (amount: string) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
};

function SatButtons({ onClick, disabled, min, max }: Props) {
  const sizes = [1000, 5000, 10000, 25000];

  return (
    <div className="flex gap-2">
      {sizes.map((size) => (
        <Button
          key={size}
          icon={<SatoshiIcon className="w-4 h-4" />}
          label={size / 1000 + "k"}
          onClick={() => onClick(size.toString())}
          fullWidth
          disabled={
            disabled ||
            (min != undefined && min > size) ||
            (max != undefined && max < size)
          }
        />
      ))}
    </div>
  );
}

export default SatButtons;
