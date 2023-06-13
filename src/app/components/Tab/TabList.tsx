import { Tab as HeadlessUiTab } from "@headlessui/react";
import { classNames } from "~/app/utils/index";

type Props = React.PropsWithChildren<{
  className?: string;
}>;

export default function TabList({ children, className }: Props) {
  return (
    <HeadlessUiTab.List
      className={classNames(
        "flex justify-center items-center rounded-md mb-2 bg-gray-100 dark:bg-surface-02dp",
        !!className && className
      )}
    >
      {children}
    </HeadlessUiTab.List>
  );
}
