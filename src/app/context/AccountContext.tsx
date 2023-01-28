import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import { useSettings } from "~/app/context/SettingsContext";
import { ACCOUNT_DEFAULT_CURRENCY } from "~/common/constants";
import api, {
  AccountInfoRes,
  getAccountInfo,
  StatusRes,
  UnlockRes,
} from "~/common/lib/api";
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

export const getAccountInfoKey = (
  id: string | null | undefined
): string | null => (id ? `accountInfo/${id}` : null);

export const buildAccountInfo = (
  id: string,
  data: AccountInfoRes
): AccountInfo => {
  const alias = data.info.alias;
  const { balance: resBalance, currency = ACCOUNT_DEFAULT_CURRENCY } =
    data.balance;
  const name = data.name;
  const balance =
    typeof resBalance === "number" ? resBalance : parseInt(resBalance); // TODO: handle amounts

  return {
    id,
    name,
    alias,
    balance,
    currency,
  };
};

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
    getFormattedInCurrency,
  } = useSettings();

  const [account, setAccount] = useState<Partial<AccountInfo> | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountBalance, setAccountBalance] = useState("");
  const [fiatBalance, setFiatBalance] = useState("");
  const [, setStatus] = useState<StatusRes>();

  const { data: accountInfoRes, mutate } = useSWR<AccountInfoRes>(
    getAccountInfoKey(account?.id),
    getAccountInfo
  );

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
    if (typeof mutate !== "function") return;
    const data = await mutate();
    setAccountData(account?.id, data);
  };

  const updateAccountBalance = (
    amount: number,
    currency?: AccountInfo["currency"]
  ) => {
    const balance = getFormattedInCurrency(amount, currency);
    setAccountBalance(balance);
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

  const setAccountData = (
    id: string | undefined,
    accountInfoRes: AccountInfoRes | undefined
  ) => {
    if (id && accountInfoRes) {
      const accountInfo = buildAccountInfo(id, accountInfoRes);
      setAccount(accountInfo);
      updateAccountBalance(accountInfo.balance, accountInfo.currency);
    }
  };

  useEffect(() => {
    setAccountData(account?.id, accountInfoRes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountInfoRes]);

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
