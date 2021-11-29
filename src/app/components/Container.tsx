type Props = {
  children: React.ReactNode;
};

function Container({ children }: Props) {
  return (
    <div className="container max-w-screen-lg mx-auto px-4">{children}</div>
  );
}

export default Container;
