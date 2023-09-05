type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl";

type Props = {
  children: React.ReactNode;
  justifyBetween?: boolean;
  maxWidth?: MaxWidth;
};

function Container({
  children,
  justifyBetween = false,
  maxWidth = "lg",
}: Props) {
  // Avoid dynamically created class strings as PurgeCSS doesn't understand this.
  const getMaxWidthClass = (maxWidth: MaxWidth) => {
    switch (maxWidth) {
      case "sm":
        return "max-w-screen-sm";
      case "md":
        return "max-w-screen-md";
      case "lg":
        return "max-w-screen-lg";
      case "xl":
        return "max-w-screen-xl";
      case "2xl":
        return "max-w-screen-2xl";
    }
  };

  return (
    <div
      className={`container mx-auto px-4 pb-4 ${getMaxWidthClass(maxWidth)} ${
        justifyBetween
          ? "h-full flex flex-col justify-between no-scrollbar"
          : ""
      }`}
    >
      {children}
    </div>
  );
}

export default Container;
