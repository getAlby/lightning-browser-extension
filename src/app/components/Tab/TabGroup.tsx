import { Tab as HeadlessUiTab } from "@headlessui/react";

type Props = React.PropsWithChildren<{}>;

export default function TabGroup({ children }: Props) {
  return <HeadlessUiTab.Group>{children}</HeadlessUiTab.Group>;
}
