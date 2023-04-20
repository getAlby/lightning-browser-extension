import { Tab as HeadlessUiTab } from "@headlessui/react";

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = React.PropsWithChildren<{}>;

export default function TabGroup({ children }: Props) {
  return <HeadlessUiTab.Group>{children}</HeadlessUiTab.Group>;
}
