import { Tab as HeadlessUiTab } from "@headlessui/react";
import { classNames } from "~/app/utils/index";

type Props = React.PropsWithChildren<{
  className?: string;
}>;

export default function TabList({ children, className }: Props) {
  return (
    <HeadlessUiTab.List
      className={classNames(
        "flex justify-center items-center",
        !!className && className
      )}
    >
      {children}
    </HeadlessUiTab.List>
  );
}
