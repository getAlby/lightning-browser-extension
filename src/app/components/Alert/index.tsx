type Props = {
  type: "warn";
  children: React.ReactNode;
};

export default function Alert({ type, children }: Props) {
  return (
    <div className="rounded-md font-medium p-4 text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-900">
      <p>{children}</p>
    </div>
  );
}
