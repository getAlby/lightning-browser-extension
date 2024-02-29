type Props = {
  title: string;
  description: string;
  content: React.ReactNode;
  actions: React.ReactNode;
  icon: React.ReactNode;
};

function ConnectorPath({ title, icon, description, content, actions }: Props) {
  return (
    <div className="flex flex-col p-10 border border-gray-200 dark:border-neutral-700 rounded-2xl bg-white dark:bg-surface-02dp">
      <div className="flex flex-col sm:flex-row items-center mb-4 space-x-3">
        {icon}
        <h1 className="text-xl font-bold dark:text-white text-center">
          {title}
        </h1>
      </div>
      <p className="text-gray-800 dark:text-neutral-200 mb-6">{description}</p>
      <div className="flex flex-col space-y-4 text-sm mb-8 dark:text-white">
        {content}
      </div>
      <div className="flex gap-4 flex-col sm:flex-row mt-auto">{actions}</div>
    </div>
  );
}

export default ConnectorPath;
