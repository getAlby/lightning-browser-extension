import { useAccount } from "~/app/context/AccountContext";
import { classNames } from "~/app/utils";

type Props = {
  className?: string;
};

function BalanceBox({ className }: Props) {
  const { balancesDecorated } = useAccount();
  const balanceParts = balancesDecorated.accountBalance.split(" ");

  return (
    <div
      className={classNames(
        "w-full flex flex-col items-center justify-center dark:text-white p-4",
        className ?? ""
      )}
    >
      {balancesDecorated.accountBalance && (
        <div className="text-2xl">
          <span className="font-medium">{balanceParts[0]}</span>
          <span>&nbsp;{balanceParts[1]}</span>
        </div>
      )}

      {balancesDecorated.fiatBalance && (
        <span className="text-gray-500 mt-2">
          ~{balancesDecorated.fiatBalance}
        </span>
      )}
    </div>
  );
}

export default BalanceBox;
