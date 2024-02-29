export type ExtensionKeyCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
};

export function ExtensionKeyCard({
  icon,
  title,
  description,
  onClick,
}: ExtensionKeyCardProps) {
  return (
    <button
      className="gap-4 text-left border border-gray-300 dark:border-neutral-800 rounded-2xl p-8 bg-white dark:bg-surface-01dp hover:bg-gray-50 dark:focus:bg-surface-02dp text-gray-800 dark:text-neutral-200 cursor-pointer flex flex-col flex-1 focus:ring-primary focus:border-primary focus:ring-1 focus:bg-amber-50 dark:hover:bg-surface-02dp"
      onClick={onClick}
    >
      <div className="flex-shrink-0 flex">{icon}</div>
      <div className="flex-grow space-y-0.5">
        <div className="font-medium leading-7 text-lg">{title}</div>
        <div className="text-gray-600 dark:text-neutral-400 text-md leading-6">
          {description}
        </div>
      </div>
    </button>
  );
}
