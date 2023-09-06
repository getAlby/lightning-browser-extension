import { CaretRightIcon } from "@bitcoin-design/bitcoin-icons-react/outline";

export type IconLinkCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
};

export function IconLinkCard({
  icon,
  title,
  description,
  onClick,
}: IconLinkCardProps) {
  return (
    <div
      className="shadow rounded-md p-4 bg-white dark:bg-surface-01dp hover:bg-gray-50 dark:hover:bg-surface-02dp text-gray-800 dark:text-neutral-200 cursor-pointer flex flex-row items-center gap-3"
      onClick={onClick}
    >
      <div className="flex-shrink-0 flex justify-center">{icon}</div>
      <div className="flex-grow">
        <div className="font-medium leading-5 text-sm md:text-base">
          {title}
        </div>
        <div className="text-gray-600 dark:text-neutral-400 text-xs leading-4 md:text-sm">
          {description}
        </div>
      </div>
      <div className="flex-shrink-0 flex justify-end ">
        <CaretRightIcon className="w-8" />
      </div>
    </div>
  );
}
