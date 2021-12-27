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
  getAccountInfo: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const unlock = (password: string, callback: VoidFunction) => {
    return api.unlock(password).then((response) => {
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

  const getAccountInfo = () => {
    const id = account?.id;
    if (!id) return;
    setAccount({ id }); // Clear current info.
    api.getAccountInfo().then((response) => {
      const { alias } = response.info;
      const balance = parseInt(response.balance.balance); // TODO: handle amounts
      setAccount({ id, alias, balance });
    });
  };

  useEffect(() => {
    api
      .getStatus()
      .then((response) => {
        if (!response.configured) {
          utils.openPage("welcome.html");
          window.close();
        } else if (response.unlocked) {
          setAccount({ id: response.currentAccountId });
          api.getAccountInfo().then((response) => {
            const { alias } = response.info;
            const balance = parseInt(response.balance.balance); // TODO: handle amounts
            setAccount({ id: response.currentAccountId, alias, balance });
          });
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
