import { useEffect, useState } from "react";
import api from "~/common/lib/api";

export const useLightningAddress = () => {
  const [lightningAddress, setLightningAddress] = useState("");
  const [loadingLightningAddress, setLoadingLightningAddress] = useState(true);

  useEffect(() => {
    (async () => {
      setLoadingLightningAddress(true);
      const response = await api.getAccountInfo();
      const lightningAddress = response.info.lightning_address;
      if (lightningAddress) setLightningAddress(lightningAddress);
      setLoadingLightningAddress(false);
    })();
  }, []);

  return {
    loadingLightningAddress,
    lightningAddress,
  };
};
