export type Props = {
  children: React.ReactNode;
};

export default function RadioButtonGroup({ children }: Props) {
  return <div className="grid gap-5 grid-cols-2">{children}</div>;
}
