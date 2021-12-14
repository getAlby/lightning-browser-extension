import { classNames } from "../../utils/index";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  primary?: boolean;
  direction?: "row" | "column";
};

export default function TextButton({
  type = "button",
  label,
  onClick,
  direction = "row",
  primary = true,
}: Props) {
  return (
    <button
      type={type}
      className={classNames(
        direction === "row" ? "flex-row" : "flex-col",
        primary
          ? " text-orange-bitcoin border-none shadow-none bg-transparent"
          : ``,

        "inline-flex justify-center items-center  font-medium rounded-md shadow-sm  transition duration-150"
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
