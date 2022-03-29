import { classNames } from "../../utils/index";
import Loading from "../Loading";

export type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  compact?: boolean;
  label: string;
  icon?: React.ReactNode;
  primary?: boolean;
  loading?: boolean;
  disabled?: boolean;
  direction?: "row" | "column";
};

export default function Button({
  type = "button",
  label,
  onClick,
  disabled,
  direction = "row",
  icon,
  fullWidth = false,
  primary = false,
  loading = false,
  compact = false,
}: Props) {
  const px = fullWidth ? "px-0" : compact ? "px-4" : "px-7";
  const py = compact ? "py-1" : "py-2";
  const iconMargin = compact ? "" : direction === "row" ? "mr-2" : "";

  return (
    <button
      type={type}
      className={classNames(
        direction === "row" ? "flex-row" : "flex-col",
        fullWidth && "w-full",
        px,
        py,
        primary
          ? "bg-orange-bitcoin text-white border border-transparent"
          : `bg-white text-gray-700 border border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500`,
        primary && !disabled && "hover:bg-orange-bitcoin-700",
        !primary && !disabled && "hover:bg-gray-100 dark:hover:bg-gray-600",
        disabled ? "cursor-default opacity-60" : "cursor-pointer",
        compact ? "text-sm" : "",
        "inline-flex justify-center items-center font-medium rounded-md shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-bitcoin transition duration-150"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {loading && (
        <div className={iconMargin}>
          <Loading color={primary ? "white" : "black"} />
        </div>
      )}
      {icon && <div className={iconMargin}>{icon}</div>}
      {label}
    </button>
  );
}
