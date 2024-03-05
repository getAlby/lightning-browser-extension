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
      className="flex flex-col flex-1 text-left border border-gray-200 dark:border-neutral-800 rounded-md p-6 bg-white dark:bg-surface-01dp hover:bg-gray-300 dark:hover:bg-neutral-700 focus:bg-amber-50 dark:focus:bg-surface-02dp cursor-pointer  focus:ring-primary focus:border-primary focus:ring-1 gap-2"
      onClick={onClick}
    >
      <div className="flex-shrink-0 flex">{icon}</div>
      <div className="flex-grow space-y-0.5">
        <div className="font-medium leading-7 text-md text-gray-800 dark:text-neutral-200">
          {title}
        </div>
        <div className="text-gray-600 dark:text-neutral-400 text-sm leading-6">
          {description}
        </div>
      </div>
    </button>
  );
}
