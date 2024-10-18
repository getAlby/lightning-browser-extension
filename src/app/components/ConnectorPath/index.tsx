type Props = {
  title: string;
  description: string;
  actions: React.ReactNode;
  icon: React.ReactNode;
};

function ConnectorPath({ title, icon, description, actions }: Props) {
  return (
    <div className="text-gray-600 dark:text-neutral-400 flex flex-col p-8 border border-gray-200 dark:border-neutral-700 rounded-2xl bg-white dark:bg-surface-02dp">
      <div className="flex flex-col sm:flex-row items-center mb-4 space-x-3">
        {icon}
        <h1 className="text-xl font-bold dark:text-white text-center">
          {title}
        </h1>
      </div>
      <p className="mb-8">{description}</p>
      <div className="flex gap-4 flex-col sm:flex-row mt-auto">{actions}</div>
    </div>
  );
}

export default ConnectorPath;
