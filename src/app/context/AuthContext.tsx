import { useState, useEffect, createContext, useContext } from "react";
import utils from "../../common/lib/utils";

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
  getAccountInfo: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const unlock = (password: string, callback: VoidFunction) => {
    return utils.call("unlock", { password }).then((response) => {
      setAccount({ id: response.currentAccountId });
      callback();
    });
  };

  const lock = (callback: VoidFunction) => {
    return utils.call("lock").then(() => {
      setAccount(null);
      callback();
    });
  };

  const getAccountInfo = (accountId?: string) => {
    const id = accountId || account?.id;
    if (!id) return;
    setAccount({ id }); // Clear current info.
    utils.call("accountInfo").then((response) => {
      const { alias } = response.info;
      const balance = parseInt(response.balance.balance); // TODO: handle amounts
      setAccount({ id, alias, balance });
    });
  };

  useEffect(() => {
    utils
      .call("status")
      .then((response) => {
        if (!response.configured) {
          utils.openPage("welcome.html");
          window.close();
        } else if (response.unlocked) {
          setAccount(response.currentAccountId);
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
  }, []);

  const value = { account, getAccountInfo, loading, unlock, lock };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
