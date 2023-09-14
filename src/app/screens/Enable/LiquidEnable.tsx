import React, { useEffect, useState } from "react";
import LiquidEnableComponent from "~/app/components/Enable/LiquidEnable";

import Onboard from "~/app/components/onboard";
import { useAccount } from "~/app/context/AccountContext";
import api from "~/common/lib/api";
import type { OriginData } from "~/types";

type Props = {
  origin: OriginData;
};

export default function LiquidEnable(props: Props) {
  const [accountComponent, setAccountComponent] =
    useState<React.ReactNode | null>(null); // State to store the component to render

  const { account } = useAccount();

  useEffect(() => {
    async function fetchAccountAndSetComponent() {
      try {
        const fetchedAccount = await api.getAccount();

        if (fetchedAccount.hasMnemonic) {
          setAccountComponent(<LiquidEnableComponent origin={props.origin} />);
        } else {
          setAccountComponent(<Onboard />);
        }
      } catch (e) {
        console.error(e);
      }
    }

    fetchAccountAndSetComponent();
  }, [props.origin, account]);

  return <div>{accountComponent}</div>;
}
