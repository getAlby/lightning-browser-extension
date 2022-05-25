type Props = {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
};

function Container({ children, maxWidth = "lg" }: Props) {
  return (
    <div className={`container max-w-screen-${maxWidth} mx-auto px-4`}>
      {children}
    </div>
  );
}

export default Container;
