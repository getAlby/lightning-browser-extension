import Button from "../Button";

type Props = {
  onClick: (amount: string) => void;
};

function SatButtons({ onClick }: Props) {
  return (
    <div className="grid grid-rows-2 lg:grid-rows-1 grid-flow-col gap-2 mt-2 text-sm">
      <Button label="100 sat⚡" onClick={() => onClick("100")} small />
      <Button label="1K sat⚡" onClick={() => onClick("1000")} small />
      <Button label="5K sat⚡" onClick={() => onClick("5000")} small />
      <Button label="10K sat⚡" onClick={() => onClick("10000")} small />
    </div>
  );
}

export default SatButtons;
