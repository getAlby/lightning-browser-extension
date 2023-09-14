import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Enable from "~/app/components/Enable";
import toast from "~/app/components/Toast";
import Onboard from "~/app/screens/Onboard/Prompt";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import type { OriginData } from "~/types";

type Props = {
  origin: OriginData;
};

export default function WebbtcEnable(props: Props) {
  const hasFetchedData = useRef(false);
  const [loading, setLoading] = useState(false);
  const [accountComponent, setAccountComponent] =
    useState<React.ReactNode | null>(null); // State to store the component to render

  const { t: tCommon } = useTranslation("common");

  const enable = useCallback(() => {
    try {
      setLoading(true);
      msg.reply({
        enabled: true,
        remember: true,
      });
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`${tCommon("error")}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [tCommon]);

  useEffect(() => {
    async function getAllowance() {
      try {
        const allowance = await msg.request("getAllowance", {
          domain: props.origin.domain,
          host: props.origin.host,
        });
        const account = await api.getAccount();
        if (allowance && allowance.enabled && account.nostrEnabled) {
          enable();
        }
      } catch (e) {
        if (e instanceof Error) console.error(e.message);
      }
    }

    // Run once.
    if (!hasFetchedData.current) {
      getAllowance();
      hasFetchedData.current = true;
    }
  }, [enable, props.origin.domain, props.origin.host]);

  useEffect(() => {
    // Fetch account data and set the component to render based on the result

    async function fetchAccountAndSetComponent() {
      try {
        const account = await api.getAccount();

        if (account.nostrEnabled) {
          setAccountComponent(<Enable origin={props.origin} />);
        } else {
          setAccountComponent(<Onboard />);
        }
      } catch (e) {
        // Handle any errors that occur during account fetching
        console.error(e);
      }
    }

    fetchAccountAndSetComponent(); // Call the function when the component mounts
  }, [props.origin]);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        // Render the component based on the accountComponent state
        accountComponent
      )}
    </div>
  );
}
