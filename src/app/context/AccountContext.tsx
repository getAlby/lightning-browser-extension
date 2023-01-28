import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import { useSettings } from "~/app/context/SettingsContext";
import api, { StatusRes, UnlockRes } from "~/common/lib/api";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import type { AccountInfo } from "~/types";

interface AccountContextType {
  account: Partial<AccountInfo> | null;
  balancesDecorated: {
    fiatBalance: string;
    accountBalance: string;
  };
  loading: boolean;
  unlock: (user: string, callback: VoidFunction) => Promise<void>;
  lock: (callback: VoidFunction) => void;
  /**
   * Set new id and clears current info, which causes a loading indicator for the alias/balance
   */
  setAccountId: (id: string) => void;
  /**
   * revalidation (mark the data as expired and trigger a refetch) for the resource
   */
  refetchAccountInfo: () => Promise<void>;
}

const AccountContext = createContext({} as AccountContextType);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
    getFormattedInCurrency,
  } = useSettings();

  const [account, setAccount] = useState<AccountContextType["account"]>(null);
  const [loading, setLoading] = useState(true);
  const [accountBalance, setAccountBalance] = useState("");
  const [fiatBalance, setFiatBalance] = useState("");
  const [, setStatus] = useState<StatusRes>();

  const isSatsAccount = account?.currency === "BTC"; // show fiatValue only if the base currency is not already fiat
  const showFiat =
    !isLoadingSettings && settings.showFiat && !loading && isSatsAccount;

  const updateFiatValue = useCallback(
    async (balance: string | number) => {
      const fiat = await getFormattedFiat(balance);
      setFiatBalance(fiat);
    },
    [getFormattedFiat]
  );

  const unlock = (password: string, callback: VoidFunction) => {
    return api.unlock(password).then(({ currentAccountId }: UnlockRes) => {
      setAccountId(currentAccountId);

      // callback - e.g. navigate to the requested route after unlocking
      callback();
    });
  };

  const lock = (callback: VoidFunction) => {
    return msg.request("lock").then(() => {
      setAccount(null);
      callback();
    });
  };

  const setAccountId = async (id: string) => {
    setAccount({ id });
  };

  const refetchAccountInfo = async () => {
    const accountInfo = await api.refetchAccountInfo(account?.id || null);
    if (accountInfo) {
      // eslint-disable-next-line
      setAccount(accountInfo as any);
      updateAccountBalance(accountInfo.balance, accountInfo.currency);
    }
  };

  const updateAccountBalance = (
    amount: number,
    currency?: AccountInfo["currency"]
  ) => {
    const balance = getFormattedInCurrency(amount, currency);
    setAccountBalance(balance);
  };

  // hook: will be called each round, pass "id = null" to skip
  const fetchAccountInfo = async () => {
    const accountInfo = await api.useAccountInfoCached(getIdIfShouldFetch());
    if (!accountInfo) return;

    setAccount(accountInfo);
    updateAccountBalance(accountInfo.balance, accountInfo.currency);
  };

  /**
   * implicitly determines if data should be fetched
   * if new account was selected, only "id" prop is available, and name is missing
   */
  const getIdIfShouldFetch = () => {
    return !account?.name ? account?.id || null : null;
  };

  const handleGetStatus = (status: StatusRes) => {
    setStatus(status);
    const onWelcomePage = window.location.pathname.indexOf("welcome.html") >= 0;
    if (!status.configured && !onWelcomePage) {
      utils.openPage("welcome.html");
      window.close();
    } else if (status.unlocked) {
      if (status.configured && onWelcomePage) {
        utils.redirectPage("options.html");
      }
      setAccountId(status.currentAccountId);
    } else {
      setAccount(null);
    }
  };

  fetchAccountInfo();

  // Invoked only on on mount.
  useEffect(() => {
    api
      .getStatus()
      .then((status: StatusRes) => handleGetStatus(status))
      .catch((e) => toast.error(`An unexpected error occurred (${e.message})`))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to showFiat
  useEffect(() => {
    if (showFiat && typeof account?.balance === "number") {
      updateFiatValue(account.balance);
    } else {
      setFiatBalance("");
    }
  }, [showFiat, account?.balance, updateFiatValue]);

  // Listen to language change
  useEffect(() => {
    !!account?.balance &&
      updateAccountBalance(account.balance, account.currency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.locale]);

  const value = {
    account,
    balancesDecorated: {
      accountBalance,
      fiatBalance,
    },
    refetchAccountInfo,
    loading,
    lock,
    setAccountId,
    unlock,
  };

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
