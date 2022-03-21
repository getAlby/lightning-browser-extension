import { useState, createContext, useContext } from "react";

import type { Accounts } from "../../types";
import api from "../../common/lib/api";

interface AccountsContextType {
  accounts: Accounts;
  getAccounts: () => void;
}

const AccountsContext = createContext({} as AccountsContextType);

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Accounts>({});

  function getAccounts() {
    api.getAccounts().then(setAccounts);
  }

  return (
    <AccountsContext.Provider value={{ accounts, getAccounts }}>
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccounts() {
  return useContext(AccountsContext);
}
