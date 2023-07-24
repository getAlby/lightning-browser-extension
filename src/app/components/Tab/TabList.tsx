import { Tab as HeadlessUiTab } from "@headlessui/react";
import { classNames } from "~/app/utils/index";

type Props = React.PropsWithChildren<{
  className?: string;
}>;

export default function TabList({ children, className }: Props) {
  return (
    <HeadlessUiTab.List
      className={classNames(
        "grid grid-flow-col gap-1 text-center rounded-md mb-2 bg-gray-100 dark:bg-surface-02dp p-1",
        !!className && className
      )}
    >
      {children}
    </HeadlessUiTab.List>
  );
}
