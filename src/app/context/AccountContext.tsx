import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSettings } from "~/app/context/SettingsContext";
import { useAccountSWR } from "~/app/hooks/useAccountSWR";
import api, { UnlockRes } from "~/common/lib/api";
import msg from "~/common/lib/msg";
import type { AccountInfo } from "~/types";

interface AccountContextType {
  accountId?: string;
  account: Partial<AccountInfo> | null;
  balancesDecorated: {
    fiatBalance: string;
    accountBalance: string;
  };
  loading: boolean;
  balanceLoading: boolean;
  unlock: (user: string, callback: VoidFunction) => Promise<void>;
  lock: (callback: VoidFunction) => void;
  /**
   * Set new id and clears current info, which causes a loading indicator for the alias/balance
   */
  setAccountId: (id: string) => void;
  /**
   * revalidation (mark the data as expired and trigger a refetch) for the resource
   */
  refetchAccountInfo: () => void;
  setStatusLoaded: () => void;
}

const AccountContext = createContext({} as AccountContextType);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
    getFormattedInCurrency,
  } = useSettings();

  const [statusLoading, setStatusLoading] = useState(true);
  const setStatusLoaded = useCallback(
    () => setStatusLoading(false),
    [setStatusLoading]
  );
  const [accountId, setAccountId] = useState<string | undefined>();
  const [balanceLoading, setBalanceLoading] = useState(true);

  const { accountInfo, mutateAccountInfo } = useAccountSWR(accountId);
  const [fiatBalance, setFiatBalance] = useState("");

  const isSatsAccount = accountInfo?.currency === "BTC"; // show fiatValue only if the base currency is not already fiat
  const showFiat = !isLoadingSettings && settings.showFiat && isSatsAccount;

  useEffect(() => {
    if (!showFiat || typeof accountInfo?.balance !== "number") {
      setFiatBalance("");
      setBalanceLoading(false);
    } else {
      setBalanceLoading(true);
      (async () => {
        const fiat = await getFormattedFiat(accountInfo.balance);
        setFiatBalance(fiat);
        setBalanceLoading(false);
      })();
    }
  }, [getFormattedFiat, accountInfo?.balance, showFiat]);

  const unlock = (password: string, callback: VoidFunction) => {
    return api.unlock(password).then(({ currentAccountId }: UnlockRes) => {
      setAccountId(currentAccountId);

      // callback - e.g. navigate to the requested route after unlocking
      callback();
    });
  };

  const lock = (callback: VoidFunction) => {
    return msg.request("lock").then(() => {
      setAccountId(undefined);
      callback();
    });
  };

  const refetchAccountInfo = () => {
    mutateAccountInfo();
  };

  const value = {
    accountId,
    account: accountInfo?.id === accountId ? accountInfo : null,
    balancesDecorated: {
      accountBalance: accountInfo
        ? getFormattedInCurrency(accountInfo.balance || 0, accountInfo.currency)
        : "0",
      fiatBalance,
    },
    refetchAccountInfo,
    loading: statusLoading || accountId !== accountInfo?.id,
    balanceLoading,
    lock,
    setAccountId,
    unlock,
    setStatusLoaded,
  };

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
