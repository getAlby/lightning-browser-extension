import { Tab as HeadlessUiTab } from "@headlessui/react";

type Props = {
  children?: React.ReactNode;
};

export default function TabGroup({ children }: Props) {
  return <HeadlessUiTab.Group>{children}</HeadlessUiTab.Group>;
}
