import type { Ref } from "react";
import { forwardRef } from "react";
import Loading from "~/app/components/Loading";
import { classNames } from "~/app/utils/index";

export type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
  halfWidth?: boolean;
  label: string;
  icon?: React.ReactNode;
  primary?: boolean;
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
      fullWidth = false,
      halfWidth = false,
      primary = false,
      outline = false,
      loading = false,
      flex = false,
      className,
    }: Props,
    ref: Ref<HTMLButtonElement>
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={classNames(
          direction === "row" ? "flex-row" : "flex-col",
          fullWidth && "w-full",
          halfWidth && "w-1/2 first:mr-2 last:ml-2",
          fullWidth || halfWidth ? "px-0 py-2" : "px-7 py-2",
          primary
            ? "bg-gray-900 text-white border border-transparent"
            : "bg-white text-gray-900 border border-gray-900 dark:bg-surface-02dp hover:bg-gray-900 hover:text-white",
          !disabled && "hover:bg-gray-700",

          disabled ? "cursor-default opacity-60" : "cursor-pointer",
          flex && "flex-1",
          "inline-flex hover:shadow justify-center items-center font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition duration-150",
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
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
