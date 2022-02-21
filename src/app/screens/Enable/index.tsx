import { useState, useEffect, useCallback, useRef } from "react";

import Button from "../../components/Button";
import PublisherCard from "../../components/PublisherCard";
import msg from "../../../common/lib/msg";
import type { OriginData } from "../../../types";

type Props = {
  origin: OriginData;
};

function Enable(props: Props) {
  const hasFetchedData = useRef(false);
  const [, setLoading] = useState(true);
  const [remember] = useState(true);
  const [, setEnabled] = useState(false);
  const [budget] = useState(null);

  const enable = useCallback(() => {
    setEnabled(true);
    msg.reply({
      enabled: true,
      remember,
      budget,
    });
  }, [budget, remember]);

  function reject(event: React.MouseEvent<HTMLAnchorElement>) {
    msg.error("User rejected");
    event.preventDefault();
  }

  useEffect(() => {
    async function getAllowance() {
      try {
        const allowance = await msg.request("getAllowance", {
          domain: props.origin.domain,
          host: props.origin.host,
        });
        if (allowance && allowance.enabled) {
          enable();
        }
        setLoading(false);
      } catch (e) {
        if (e instanceof Error) console.log(e.message);
      }
    }

    // Run once.
    if (!hasFetchedData.current) {
      getAllowance();
      hasFetchedData.current = true;
    }
  }, [enable, props.origin.domain, props.origin.host]);

  return (
    <div>
      <PublisherCard title={props.origin.name} image={props.origin.icon} />

      <div className="text-center p-6">
        <h3 className="text-xl mb-4 dark:text-white">
          Connect with <i>{props.origin.host}</i>
        </h3>

        <p className="text-gray-500 mb-4 dark:text-gray-400">
          <strong>{props.origin.name}</strong> does not have access to your
          account.
        </p>
        <p className="text-gray-500 mb-4 dark:text-gray-400">
          Do you want to grant them access?
        </p>

        <div className="mt-8 mb-5">
          <Button label="Enable" fullWidth onClick={enable} primary />
        </div>

        <p className="mb-3 underline text-sm text-gray-300">
          Only connect with sites you trust.
        </p>

        <a
          className="underline text-sm text-gray-500 dark:text-gray-400"
          href="#"
          onClick={reject}
        >
          Cancel
        </a>
      </div>
    </div>
  );
}

export default Enable;
