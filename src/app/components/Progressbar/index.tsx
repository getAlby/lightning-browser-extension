type Props = {
  percentage: string;
};

export default function Progressbar({ percentage }: Props) {
  return (
    <div className="relative">
      <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
        <div
          style={{ width: `${percentage}%` }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
        ></div>
      </div>
    </div>
  );
}
