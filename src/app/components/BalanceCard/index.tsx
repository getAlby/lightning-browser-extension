import Skeleton from "react-loading-skeleton";

export type Props = {
  alias: string;
  crypto: string;
  fiat: string;
};

const skeletonStyle = {
  opacity: 0.5,
};

function BalanceCard({ alias, crypto, fiat }: Props) {
  return (
    <div className={`bg-blue-bitcoin p-6 pb-2 rounded-2xl shadow-lg`}>
      <p className="text-sm	font-normal text-white">
        {alias || <Skeleton style={skeletonStyle} />}
      </p>
      <p className="text-2xl font-medium text-white mt-2 mb-0">
        {crypto || <Skeleton style={skeletonStyle} />}
      </p>
      <p className="text-sm font-normal text-white mt-1 mb-0">
        {fiat || <Skeleton style={skeletonStyle} />}
      </p>
    </div>
  );
}

export default BalanceCard;
