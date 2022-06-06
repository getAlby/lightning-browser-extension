import { useState, createContext, useContext } from "react";
import api from "~/common/lib/api";
import type { Accounts } from "~/types";

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
