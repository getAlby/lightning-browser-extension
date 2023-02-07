import { WalletIcon } from "@bitcoin-design/bitcoin-icons-react/outline";

type Props = {
  name: string;
  size?: number | string;
};

const Avatar = (props: Props) => {
  return <WalletIcon className="-ml-1 w-8 h-8 opacity-50 dark:text-white" />;
};

export default Avatar;
