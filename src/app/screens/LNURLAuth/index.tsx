import { useEffect, useState } from "react";
import LNURLAuthComponent from "~/app/components/LNURLAuth";
import Onboard from "~/app/components/onboard";
import { useAccount } from "~/app/context/AccountContext";
import api from "~/common/lib/api";

export default function LNURLAuth() {
  const { account } = useAccount();
  const [hasMnemonic, setHasMnemonic] = useState(false);

  useEffect(() => {
    async function fetchAccountAndSetComponent() {
      try {
        const fetchedAccount = await api.getAccount();

        if (fetchedAccount.nostrEnabled) {
          setHasMnemonic(true);
        } else {
          setHasMnemonic(false);
        }
      } catch (e) {
        console.error(e);
      }
    }

    fetchAccountAndSetComponent();
  }, [account]);

  return <div>{hasMnemonic ? <LNURLAuthComponent /> : <Onboard />}</div>;
}
