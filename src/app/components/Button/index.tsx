import { classNames } from "~/app/utils/index";
import Loading from "../Loading";

export type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
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
}: Props) {
  return (
    <button
      type={type}
      className={classNames(
        direction === "row" ? "flex-row" : "flex-col",
        fullWidth && "w-full",
        fullWidth ? "px-0 py-2" : "px-7 py-2",
        primary
          ? "bg-orange-bitcoin text-white border border-transparent"
          : `bg-white text-gray-700 border border-gray-300 dark:bg-surface-02dp dark:text-neutral-200 dark:border-neutral-800`,
        primary && !disabled && "hover:bg-orange-bitcoin-700",
        !primary && !disabled && "hover:bg-gray-100 dark:hover:bg-surface-16dp",
        disabled ? "cursor-default opacity-60" : "cursor-pointer",
        "inline-flex justify-center items-center font-medium rounded-md shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-bitcoin transition duration-150"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {loading && (
        <div className={direction === "row" ? "mr-2" : ""}>
          <Loading color={primary ? "white" : "black"} />
        </div>
      )}
      {icon}
      {label}
    </button>
  );
}
