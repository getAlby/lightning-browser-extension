import { FC, useCallback, useEffect, useState } from "react";
import browser from "webextension-polyfill";
import api from "~/common/lib/api";
import type { Allowance, Battery } from "~/types";

import AllowanceView from "./AllowanceView";
import DefaultView from "./DefaultView";

const Home: FC = () => {
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [currentUrl, setCurrentUrl] = useState<URL | null>(null);
  const [loadingAllowance, setLoadingAllowance] = useState(true);
  const [lnData, setLnData] = useState<Battery[]>([]);
  const [renderDefaultView, setRenderDefaultView] = useState(false);

  const loadAllowance = useCallback(async () => {
    try {
      setLoadingAllowance(true);

      // typeguard, currentUrl should exist at this point
      if (!currentUrl) throw new Error("No established browser connection");

      const result = await api.getAllowance(currentUrl.host);

      if (result.enabled) {
        setAllowance(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAllowance(false);
    }
  }, [currentUrl]);

  const handleLightningDataMessage = (response: {
    action: string;
    args: Battery[];
  }) => {
    if (response.action === "lightningData") {
      setLnData(response.args);
    }
  };

  // loadAllowance as soon as currentURL is set
  useEffect(() => {
    if (currentUrl) {
      loadAllowance();
    }
  }, [currentUrl, loadAllowance]);

  // Get current URL data on mount
  // and start listeners
  useEffect(() => {
    const getCurrentURL = async () => {
      const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      const currentUrl = tabs.length && tabs[0].url;

      if (currentUrl) {
        const url = new URL(currentUrl);
        setCurrentUrl(url);

        if (currentUrl.startsWith("http")) {
          browser.tabs.sendMessage(tabs[0].id as number, {
            action: "extractLightningData",
          });
        }
      } else {
        setLoadingAllowance(false);
      }
    };

    getCurrentURL();

    // Enhancement data is loaded asynchronously (for example because we need to fetch additional data).
    browser.runtime.onMessage.addListener(handleLightningDataMessage);

    return () => {
      browser.runtime.onMessage.removeListener(handleLightningDataMessage);
    };
  }, []);

  if (loadingAllowance) {
    return null;
  }

  if (allowance && !renderDefaultView) {
    return (
      <AllowanceView
        allowance={allowance}
        lnDataFromCurrentTab={lnData}
        onGoBack={() => setRenderDefaultView(true)}
        onEditComplete={loadAllowance}
        onDeleteComplete={() => setAllowance(null)}
      />
    );
  }

  return (
    <DefaultView
      renderPublisherWidget={!allowance}
      currentUrl={currentUrl}
      lnDataFromCurrentTab={lnData}
    />
  );
};

export default Home;
