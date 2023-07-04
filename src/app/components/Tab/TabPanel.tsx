import { Tab as HeadlessUiTab } from "@headlessui/react";
import { classNames } from "~/app/utils/index";

type Props = React.PropsWithChildren<{
  className?: string;
}>;

export default function TabPanel({ children, className }: Props) {
  return (
    <HeadlessUiTab.Panel className={classNames(!!className && className)}>
      {children}
    </HeadlessUiTab.Panel>
  );
}
