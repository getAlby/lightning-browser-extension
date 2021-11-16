import React, { useState, useEffect, createContext } from "react";
import utils from "../../common/lib/utils";

interface AuthContextType {
  user: any;
  loading: boolean;
  unlock: (user: string, callback: VoidFunction) => void;
  lock: (callback: VoidFunction) => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const unlock = (password: string, callback: VoidFunction) => {
    return utils.call("unlock", { password }).then(() => {
      setUser("alby");
      callback();
    });
  };

  const lock = (callback: VoidFunction) => {
    return utils.call("lock").then(() => {
      setUser(null);
      callback();
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
          setUser("alby");
        } else {
          setUser(null);
        }
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const value = { user, loading, unlock, lock };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}
