import { useState, useEffect, createContext, useContext } from "react";
import utils from "../../common/lib/utils";
import api from "../../common/lib/api";

interface Account {
  id: string;
  alias?: string;
  balance?: number;
}

interface AuthContextType {
  account: Account | null;
  loading: boolean;
  unlock: (user: string, callback: VoidFunction) => void;
  lock: (callback: VoidFunction) => void;
  /**
   * Set new id and clears current info, which causes a loading indicator for the alias/balance
   */
  setAccountId: (id: string) => void;
  /**
   * Get's the additional account info: alias/balance
   */
  getAccountInfo: (id?: string) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const unlock = (password: string, callback: VoidFunction) => {
    return api.unlock(password).then((response) => {
      getAccountInfo(response.currentAccountId);

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

  const getAccountInfo = (accountId?: string) => {
    const id = accountId || account?.id;
    if (!id) return;
    return api.getAccountInfo().then((response) => {
      const { alias } = response.info;
      const balance = parseInt(response.balance.balance); // TODO: handle amounts
      setAccount({ id, alias, balance });
    });
  };

  // Invoked only on on mount.
  useEffect(() => {
    api
      .getStatus()
      .then((response) => {
        if (!response.configured) {
          utils.openPage("welcome.html");
          window.close();
        } else if (response.unlocked) {
          setAccountId(response.currentAccountId);
          getAccountInfo(response.currentAccountId);
        } else {
          setAccount(null);
        }
      })
      .catch((e) => {
        alert(`An unexpected error occurred (${e.message})`);
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    account,
    setAccountId,
    getAccountInfo,
    loading,
    unlock,
    lock,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
