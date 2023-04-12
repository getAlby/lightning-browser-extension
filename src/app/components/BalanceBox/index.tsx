import { useAccount } from "~/app/context/AccountContext";

type Props = {
  className: string;
};
function BalanceBox(pops: Props) {
  const { balancesDecorated, account } = useAccount();
  const hasFiatBalance = Boolean(balancesDecorated.fiatBalance);
  const { balance, currency } = account || {};

  return (
    <div
      className={`w-full flex flex-col items-center justify-center bg-white dark:bg-surface-02dp dark:text-white shadow rounded-md  ${
        hasFiatBalance ? "" : "min-h-[88px]"
      }`}
    >
      <div className={hasFiatBalance ? "mt-4 mb-2" : "mt-0 mb-0"}>
        <span className="text-xl font-medium ">
          {balance}
          <span className="text-xl font-normal m-1">{currency}</span>
        </span>
      </div>
      {balancesDecorated.fiatBalance && (
        <span className="text-sm font-normal text-gray-500 mb-4 ">
          ~{balancesDecorated.fiatBalance}
        </span>
      )}
    </div>
  );
}

export default BalanceBox;
