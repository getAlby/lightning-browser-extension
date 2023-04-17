import { Tab as HeadlessUiTab } from "@headlessui/react";
import { classNames } from "~/app/utils/index";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
};

export default function TabPanel({ children, className }: Props) {
  return (
    <HeadlessUiTab.Panel className={classNames(!!className && className)}>
      {children}
    </HeadlessUiTab.Panel>
  );
}
