import { useAccount } from "~/app/context/AccountContext";

type Props = {
  className: string;
};

function BalanceBox(props: Props) {
  const { balancesDecorated } = useAccount();

  const [balance, sats] = balancesDecorated.accountBalance.split(" ");
  return (
    <div
      className={
        "w-full rounded-[6px] flex flex-col items-center justify-center bg-white hover:bg-gray-50 text-black dark:bg-surface-02dp dark:text-white dark:hover:bg-surface-16dp shadow transition duration-150 "
      }
    >
      <span className={" mt-[16px] mb-[8px] "}>
        <span className="text-xl font-medium">{balance}</span>
        <span className="text-xl font-normal m-1">{sats}</span>
      </span>
      <span className={"text-xl font-normal text-gray-500 mb-[16px] "}>
        ~{balancesDecorated.fiatBalance}
      </span>
    </div>
  );
}

export default BalanceBox;
