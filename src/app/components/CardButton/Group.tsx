export type Props = {
  children: React.ReactNode;
};

export default function CardButtonGroup({ children }: Props) {
  return <div className="flex flex-col sm:flex-row gap-5">{children}</div>;
}
