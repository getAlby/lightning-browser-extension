import type { Ref } from "react";
import { forwardRef } from "react";
import Loading from "~/app/components/Loading";
import { classNames } from "~/app/utils/index";

export type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  halfWidth?: boolean;
  label: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  primary?: boolean;
  destructive?: boolean;
  outline?: boolean;
  loading?: boolean;
  disabled?: boolean;
  flex?: boolean;
  direction?: "row" | "column";
};

const Button = forwardRef(
  (
    {
      type = "button",
      label,
      onClick,
      disabled,
      direction = "row",
      icon,
      iconRight,
      fullWidth = false,
      halfWidth = false,
      primary = false,
      outline = false,
      loading = false,
      destructive = false,
      flex = false,
      className,
      ...otherProps
    }: Props,
    ref: Ref<HTMLButtonElement>
  ) => {
    return (
      <button
        {...otherProps}
        ref={ref}
        type={type}
        className={classNames(
          direction === "row" ? "flex-row" : "flex-col",
          fullWidth && "w-full",
          halfWidth && "w-1/2 first:mr-2 last:ml-2",
          fullWidth || halfWidth ? "px-0 py-2" : "px-7 py-2",
          primary
            ? "bg-primary-gradient border-2 border-transparent text-black"
            : outline
            ? "bg-white text-gray-700 border-2 border-primary dark:text-primary dark:bg-surface-02dp"
            : destructive
            ? "bg-white text-red-700 dark:text-red-300 border-2 border-transparent dark:bg-surface-02dp"
            : `bg-white text-gray-700 dark:bg-surface-02dp dark:text-neutral-200 dark:border-neutral-800`,
          primary && !disabled && "hover:bg-primary-gradient-hover",
          !primary &&
            !disabled &&
            "hover:bg-gray-50 dark:hover:bg-surface-16dp",
          disabled ? "cursor-default opacity-60" : "cursor-pointer",
          flex && "flex-1",
          "inline-flex justify-center items-center gap-1 font-medium bg-origin-border shadow rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition duration-150 whitespace-nowrap",
          !!className && className
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
        {iconRight}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
