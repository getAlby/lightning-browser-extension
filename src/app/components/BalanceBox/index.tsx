import Skeleton from "react-loading-skeleton";
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
            <Skeleton
              style={{ opacity: 0.2 }}
              className="w-20"
              baseColor="#AAA"
              highlightColor="#FFF"
            />
          </div>
          <Skeleton className="w-10 mt-2" />
        </>
      )}
      {!balanceLoading && balancesDecorated.accountBalance && (
        <div className="text-2xl">
          <span className="font-medium slashed-zero">{balanceParts[0]}</span>
          <span>&nbsp;{balanceParts[1]}</span>
        </div>
      )}
      {!balanceLoading && balancesDecorated.fiatBalance && (
        <span className="text-gray-500 mt-2">
          ~{balancesDecorated.fiatBalance}
        </span>
      )}
    </div>
  );
}

export default BalanceBox;
