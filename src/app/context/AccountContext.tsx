import { useState, useEffect, createContext, useContext } from "react";
import { toast } from "react-toastify";
import api from "~/common/lib/api";
import utils from "~/common/lib/utils";
import { getSatValue, getFiatValue } from "~/common/utils/currencyConvert";
import type { AccountInfo } from "~/types";

interface AccountContextType {
  account: {
    id: string;
    name?: string;
    alias?: string;
    balance?: number;
  } | null;
  balancesDecorated: {
    fiatBalance: string;
    satsBalance: string;
  };
  loading: boolean;
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
    isLatestRate?: boolean;
  }) => Promise<AccountInfo | undefined>;
}

const AccountContext = createContext({} as AccountContextType);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<AccountContextType["account"]>(null);
  const [loading, setLoading] = useState(true);
  const [satsBalance, setSatBalance] = useState("");
  const [fiatBalance, setFiatBalance] = useState("");

  const unlock = (password: string, callback: VoidFunction) => {
    return api.unlock(password).then((response) => {
      setAccountId(response.currentAccountId);
      fetchAccountInfo({ accountId: response.currentAccountId });

      // callback - e.g. navigate to the requested route after unlocking
      callback();
    });
  };

  const lock = (callback: VoidFunction) => {
    return utils.call("lock").then(() => {
      setAccount(null);
      callback();
    });
  };

  const setAccountId = (id: string) => setAccount({ id });

  const updateFiatValue = async (
    balance: string | number,
    isLatestRate?: boolean
  ) => {
    const fiats = await getFiatValue(balance, isLatestRate);
    setFiatBalance(fiats);
  };

  const fetchAccountInfo = async (options?: {
    accountId?: string;
    isLatestRate?: boolean;
  }) => {
    const id = options?.accountId || account?.id;
    if (!id) return;

    const accountInfo = await api.swr.getAccountInfo(id, setAccount);
    const sats = await getSatValue(accountInfo.balance);
    setSatBalance(sats);

      updateFiatValue(accountInfo.balance, options?.isLatestRate);

    return { ...accountInfo, fiatBalance, satsBalance: sats };
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
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    account,
    balancesDecorated: {
      satsBalance,
      fiatBalance,
    },
    fetchAccountInfo,
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
