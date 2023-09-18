import { useEffect, useState } from "react";
import NostrEnableComponent from "~/app/components/Enable/NostrEnable";
import Onboard from "~/app/components/onboard";
import { useAccount } from "~/app/context/AccountContext";
import api from "~/common/lib/api";
import type { OriginData } from "~/types";

type Props = {
  origin: OriginData;
};

export default function NostrEnable(props: Props) {
  const { account } = useAccount();
  const [hasNostrKeys, setHasNostrKeys] = useState(false);

  useEffect(() => {
    async function fetchAccountInfo() {
      try {
        const fetchedAccount = await api.getAccount();

        if (fetchedAccount.nostrEnabled) {
          setHasNostrKeys(true);
        } else {
          setHasNostrKeys(false);
        }
      } catch (e) {
        console.error(e);
      }
    }

    fetchAccountInfo();
  }, [props.origin, account]);

  return (
    <>
      {hasNostrKeys ? (
        <NostrEnableComponent origin={props.origin} />
      ) : (
        <Onboard />
      )}
    </>
  );
}
