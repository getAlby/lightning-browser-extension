import SkeletonLoader from "~/app/components/SkeletonLoader";
import { useAccount } from "~/app/context/AccountContext";

type Props = {
  className?: string;
};

function BalanceBox(props: Props) {
  const { balanceLoading, balancesDecorated } = useAccount();
  const balanceParts = balancesDecorated.accountBalance.split(" ");

  return (
    <div className="w-full flex flex-col items-center justify-center dark:text-white p-4">
      {balanceLoading && (
        <>
          <div className="text-2xl">
            <SkeletonLoader className="w-32" />
          </div>
          <div className="mt-2">
            <SkeletonLoader className="w-10" />
          </div>
        </>
      )}
      {!balanceLoading && balancesDecorated.accountBalance && (
        <div className="text-2xl">
          <span className="font-medium slashed-zero">{balanceParts[0]}</span>
          <span>&nbsp;{balanceParts[1]}</span>
        </div>
      )}
      {!balanceLoading && balancesDecorated.fiatBalance && (
        <div className="text-gray-500 mt-2">
          ~{balancesDecorated.fiatBalance}
        </div>
      )}
    </div>
  );
}

export default BalanceBox;
