type Props = {
  percentage: number;
};

export default function Progressbar({ percentage }: Props) {
  return (
    <div className="relative flex w-full items-center">
      <div className="overflow-hidden h-2 flex-auto mr-2 rounded bg-gray-200">
        <div
          style={{ width: `${percentage}%` }}
          className="shadow-none flex flex-col h-2 text-center whitespace-nowrap text-white justify-center bg-primary-gradient"
        ></div>
      </div>
      <div className="text-xs text-gray-700 font-medium dark:text-neutral-400">
        {percentage.toFixed(0)}%
      </div>
    </div>
  );
}
