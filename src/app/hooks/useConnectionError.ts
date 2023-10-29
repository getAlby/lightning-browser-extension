import { useEffect, useState } from "react";
import { useAccount } from "~/app/context/AccountContext";

// account object can have 3 distinct states, depending on the available properties
// only "id" is available -> loading state
// "id", "name" and "error" is available -> connection error state
// all properties available -> account loaded successfully
// depending on the resulting "connectionError", either the ConnectionError or Screen is displayed
// the "connectionError" is determined by the "error" property of the account object
// to prevent switching back to "connectionError" false during reload (when only "id" is present), we keep track of the "lastAccountFailed"
export const useConnectionError = () => {
  const { account } = useAccount();
  // keep last tries result, to prevent screen flick back during loading state
  const [lastAccountFailed, setLastAccountFailed] = useState<boolean>(false);

  useEffect(() => {
    // skip the state during loading phase where only the id is present and check for "error" presence of loaded account
    if (Object.prototype.hasOwnProperty.call(account, "name")) {
      setLastAccountFailed(!!account?.error);
    }
  }, [setLastAccountFailed, account]);

  const connectionError = lastAccountFailed || account?.error;

  return {
    connectionError,
  };
};
