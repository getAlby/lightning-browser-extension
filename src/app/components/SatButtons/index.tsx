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
          icon={
            <svg
              className="w-4 h-4"
              data-v-52a72b4a=""
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.75 18.5V21h-1.5v-2.5h1.5zM17 16.75H7v-1.5h10v1.5zM17 12.75H7v-1.5h10v1.5zM17 8.75H7v-1.5h10v1.5zM12.75 3v2.5h-1.5V3h1.5z"
              ></path>
            </svg>
          }
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
