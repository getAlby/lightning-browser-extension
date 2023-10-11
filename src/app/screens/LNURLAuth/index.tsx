import { useEffect, useState } from "react";
import LNURLAuthComponent from "~/app/components/LNURLAuth";
import Onboard from "~/app/components/onboard";
import { useAccount } from "~/app/context/AccountContext";
import { isAlbyOAuthAccount } from "~/app/utils";
import api from "~/common/lib/api";

export default function LNURLAuth() {
  const { account } = useAccount();
  const [hasMnemonic, setHasMnemonic] = useState(false);
  const [albyOAuthAccount, setAlbyOAuthAccount] = useState(false);

  useEffect(() => {
    async function fetchAccountInfo() {
      try {
        const fetchedAccount = await api.getAccount();
        const isOAuthAccount = isAlbyOAuthAccount(fetchedAccount.connectorType);
        setAlbyOAuthAccount(isOAuthAccount);

        if (fetchedAccount.hasMnemonic) {
          setHasMnemonic(true);
        } else {
          setHasMnemonic(false);
        }
      } catch (e) {
        console.error(e);
      }
    }

    fetchAccountInfo();
  }, [account]);

  return (
    <>
      {albyOAuthAccount && !hasMnemonic ? <Onboard /> : <LNURLAuthComponent />}
    </>
  );
}
