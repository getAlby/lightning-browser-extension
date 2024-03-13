export type Props = {
  children: React.ReactNode;
};

export default function CardButtonGroup({ children }: Props) {
  return (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">{children}</div>
  );
}
