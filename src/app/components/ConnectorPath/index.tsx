type Props = {
  title: string;
  description: string;
  content: React.ReactNode;
  actions: React.ReactNode;
};

function ConnectorPath({ title, description, content, actions }: Props) {
  return (
    <div className="shadow-lg p-12 rounded-xl bg-white dark:bg-surface-02dp text-center">
      <h1 className="text-3xl font-bold dark:text-white">{title}</h1>
      <p className="text-gray-500 mt-6 dark:text-neutral-400">{description}</p>
      <div className="h-56 flex flex-col justify-center items-center">
        {content}
      </div>
      <div className="flex gap-4">{actions}</div>
    </div>
  );
}

export default ConnectorPath;
