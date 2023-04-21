import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import { useSettings } from "~/app/context/SettingsContext";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import type { AccountInfo } from "~/types";

interface AccountContextType {
  account: {
    id: AccountInfo["id"];
    name?: AccountInfo["name"];
    alias?: AccountInfo["alias"];
    balance?: AccountInfo["balance"];
    currency?: AccountInfo["currency"];
  } | null;
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
   * Fetch the additional account info: alias/balance and update account
   */
  fetchAccountInfo: (options?: {
    accountId?: string;
  }) => Promise<AccountInfo | undefined>;
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
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [accountBalance, setAccountBalance] = useState("");
  const [fiatBalance, setFiatBalance] = useState("");

  const isSatsAccount = account?.currency === "BTC"; // show fiatValue only if the base currency is not already fiat
  const showFiat =
    !isLoadingSettings && settings.showFiat && !loading && isSatsAccount;

  const unlock = (password: string, callback: VoidFunction) => {
    return api.unlock(password).then((response) => {
      setAccountId(response.currentAccountId);
      fetchAccountInfo({ accountId: response.currentAccountId });

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

  const setAccountId = (id: string) => setAccount({ id });

  const updateFiatValue = useCallback(
    async (balance: string | number) => {
      const fiat = await getFormattedFiat(balance);
      setFiatBalance(fiat);
    },
    [getFormattedFiat]
  );

  const updateAccountBalance = (
    amount: number,
    currency?: AccountInfo["currency"]
  ) => {
    const balance = getFormattedInCurrency(amount, currency);
    setAccountBalance(balance);
  };

  const fetchAccountInfo = async (options?: { accountId?: string }) => {
    setBalanceLoading(true);
    const id = options?.accountId || account?.id;
    if (!id) return;

    const callback = (accountRes: AccountInfo) => {
      setAccount(accountRes);
      updateAccountBalance(accountRes.balance, accountRes.currency);
    };

    const accountInfo = await api.swr.getAccountInfo(id, callback);
    setBalanceLoading(false);

    return { ...accountInfo, fiatBalance, accountBalance };
  };

  // Invoked only on on mount.
  useEffect(() => {
    api
      .getStatus()
      .then((response) => {
        const onWelcomePage =
          window.location.pathname.indexOf("welcome.html") >= 0;
        if (!response.configured && !onWelcomePage) {
          utils.openPage("welcome.html");
          window.close();
        } else if (response.unlocked) {
          if (response.configured && onWelcomePage) {
            utils.redirectPage("options.html");
          }
          setAccountId(response.currentAccountId);
          fetchAccountInfo({ accountId: response.currentAccountId });
        } else {
          setAccount(null);
        }
      })
      .catch((e) => {
        toast.error(`An unexpected error occurred (${e.message})`);
        console.error(
          `AccountContext: An unexpected error occurred (${e.message})`
        );
      })
      .finally(() => {
        setLoading(false);
      });

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
    fetchAccountInfo,
    loading,
    balanceLoading,
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
