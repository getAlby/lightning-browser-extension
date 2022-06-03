type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl";

type Props = {
  children: React.ReactNode;
  maxWidth?: MaxWidth;
};

function Container({ children, maxWidth = "lg" }: Props) {
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
    <div className={`container ${getMaxWidthClass(maxWidth)} mx-auto px-4`}>
      {children}
    </div>
  );
}

export default Container;
