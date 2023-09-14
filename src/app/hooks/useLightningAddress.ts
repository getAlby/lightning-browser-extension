import { useEffect, useState } from "react";
import { useAccount } from "~/app/context/AccountContext";
import api from "~/common/lib/api";

export const useLightningAddress = () => {
  const { account } = useAccount();
  const [lightningAddress, setLightningAddress] = useState("");
  const [loadingLightningAddress, setLoadingLightningAddress] = useState(false);

  useEffect(() => {
    // TODO: replace with connector-supported functionality
    if (account?.connectorType !== "alby") {
      setLightningAddress("");
      setLoadingLightningAddress(false);
      return;
    }
    (async () => {
      setLoadingLightningAddress(true);
      const response = await api.getAccountInfo();
      const lightningAddress = response.info.lightning_address;
      if (lightningAddress) setLightningAddress(lightningAddress);
      setLoadingLightningAddress(false);
    })();
  }, [account?.connectorType]);

  return {
    loadingLightningAddress,
    lightningAddress,
  };
};
