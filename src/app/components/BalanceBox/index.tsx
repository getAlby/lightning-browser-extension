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
      <div className="text-2xl slashed-zero">
        {!balanceLoading && balancesDecorated.accountBalance ? (
          <>
            <span className="font-medium">{balanceParts[0]}</span>
            <span>&nbsp;{balanceParts[1]}</span>
          </>
        ) : (
          <SkeletonLoader className="w-32" />
        )}
      </div>
      <div className="text-gray-500 mt-2">
        {!balanceLoading ? (
          <>
            {balancesDecorated.fiatBalance && (
              <>~{balancesDecorated.fiatBalance}</>
            )}
          </>
        ) : (
          <SkeletonLoader className="w-10" />
        )}
      </div>
    </div>
  );
}

export default BalanceBox;
