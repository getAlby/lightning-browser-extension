import SkeletonLoader from "@components/SkeletonLoader";
import { useAccount } from "~/app/context/AccountContext";
import { classNames } from "~/app/utils";

type Props = {
  className?: string;
};

function BalanceBox({ className }: Props) {
  const { balancesDecorated, accountLoading } = useAccount();
  const balanceParts = balancesDecorated.accountBalance.split(" ");

  return (
    <div
      className={classNames(
        "w-full flex flex-col items-center justify-center dark:text-white mt-4",
        className ?? ""
      )}
    >
      <div className="text-2xl">
        {accountLoading ? (
          <SkeletonLoader containerClassName="inline-block" className="w-32" />
        ) : (
          <>
            <span className="font-medium">{balanceParts[0]}</span>
            <span>&nbsp;{balanceParts[1]}</span>
          </>
        )}
      </div>

      {accountLoading ? (
        <SkeletonLoader containerClassName="mt-1" className="w-16" />
      ) : (
        <div className="text-gray-500 mt-1">
          {balancesDecorated.fiatBalance && (
            <>~{balancesDecorated.fiatBalance}</>
          )}
        </div>
      )}
    </div>
  );
}

export default BalanceBox;
