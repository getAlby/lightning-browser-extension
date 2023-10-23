import { useEffect, useState } from "react";
import WebbtcEnableComponent from "~/app/components/Enable/WebbtcEnable";
import Onboard from "~/app/components/onboard";
import { useAccount } from "~/app/context/AccountContext";
import api from "~/common/lib/api";
import type { OriginData } from "~/types";

type Props = {
  origin: OriginData;
};

export default function WebbtcEnable(props: Props) {
  const { account } = useAccount();
  const [hasMnemonic, setHasMnemonic] = useState(false);

  useEffect(() => {
    async function fetchAccountInfo() {
      try {
        const fetchedAccount = await api.getAccount();

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
  }, [props.origin, account]);

  return (
    <>
      {hasMnemonic ? (
        <WebbtcEnableComponent origin={props.origin} />
      ) : (
        <Onboard />
      )}
    </>
  );
}
