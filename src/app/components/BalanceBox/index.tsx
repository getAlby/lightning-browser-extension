import { useAccount } from "~/app/context/AccountContext";

type Props = {
  className?: string;
};

function BalanceBox(props: Props) {
  const { balancesDecorated } = useAccount();
  const balanceParts = balancesDecorated.accountBalance.split(" ");

  return (
    <div
      className={`w-full flex flex-col items-center justify-center dark:text-white p-4`}
    >
      {balancesDecorated.accountBalance && (
        <div className="text-xl">
          <span className="font-medium slashed-zero">{balanceParts[0]}</span>
          <span>&nbsp;{balanceParts[1]}</span>
        </div>
      )}

      {balancesDecorated.fiatBalance && (
        <span className="text-sm text-gray-500 mt-2">
          ~{balancesDecorated.fiatBalance}
        </span>
      )}
    </div>
  );
}

export default BalanceBox;
