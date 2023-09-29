import { useEffect, useState } from "react";
import LiquidEnableComponent from "~/app/components/Enable/LiquidEnable";
import Onboard from "~/app/components/onboard";
import { useAccount } from "~/app/context/AccountContext";
import api from "~/common/lib/api";
import type { OriginData } from "~/types";

type Props = {
  origin: OriginData;
};

export default function LiquidEnable(props: Props) {
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
        <LiquidEnableComponent origin={props.origin} />
      ) : (
        <Onboard />
      )}
    </>
  );
}
