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
  const [hasNostrKeys, setHasNostrkeys] = useState(false);

  useEffect(() => {
    async function fetchAccountAndSetComponent() {
      try {
        const fetchedAccount = await api.getAccount();

        if (fetchedAccount.nostrEnabled) {
          setHasNostrkeys(true);
        } else {
          setHasNostrkeys(false);
        }
      } catch (e) {
        console.error(e);
      }
    }

    fetchAccountAndSetComponent();
  }, [props.origin, account]);

  return (
    <div>
      {hasNostrKeys ? (
        <NostrEnableComponent origin={props.origin} />
      ) : (
        <Onboard />
      )}
    </div>
  );
}
