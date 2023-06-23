type Props = {
  title: string;
  description: string;
  content: React.ReactNode;
  actions: React.ReactNode;
};

function ConnectorPath({ title, description, content, actions }: Props) {
  return (
    <div className="shadow-lg p-10 rounded-xl bg-white dark:bg-surface-02dp text-center">
      <h1 className="text-2xl font-bold dark:text-white">{title}</h1>
      <p className="text-gray-500 mt-4 dark:text-neutral-400 min-h-[48px]">
        {description}
      </p>
      <div className="lg:h-56 py-4 flex flex-col justify-center items-center">
        {content}
      </div>
      <div className="flex gap-4 flex-col sm:flex-row">{actions}</div>
    </div>
  );
}

export default ConnectorPath;
