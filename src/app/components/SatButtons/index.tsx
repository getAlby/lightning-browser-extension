import Button from "../Button";

type Props = {
  onClick: (amount: string) => void;
};

function SatButtons({ onClick }: Props) {
  return (
    <div className="flex space-x-1.5 mt-2">
      <Button fullWidth label="100 sat⚡" onClick={() => onClick("100")} />
      <Button fullWidth label="1K sat⚡" onClick={() => onClick("1000")} />
      <Button fullWidth label="5K sat⚡" onClick={() => onClick("5000")} />
      <Button fullWidth label="10K sat⚡" onClick={() => onClick("10000")} />
    </div>
  );
}

export default SatButtons;
