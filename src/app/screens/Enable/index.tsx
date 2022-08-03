import ConfirmOrCancel from "@components/ConfirmOrCancel";
import PublisherCard from "@components/PublisherCard";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import type { MessageWebLnEnable } from "~/types";

function Enable() {
  const hasFetchedData = useRef(false);
  const [, setLoading] = useState(true);
  const [remember] = useState(true);
  const [, setEnabled] = useState(false);
  const [budget] = useState(null);
  const location = useLocation();

  const { message } = location.state as { message: MessageWebLnEnable };
  const { origin } = message;

  const enable = useCallback(() => {
    setEnabled(true);
    msg.reply({
      enabled: true,
      remember,
      budget,
    });
  }, [budget, remember]);

  function reject(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  async function block(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    await utils.call("addBlocklist", {
      domain: origin.domain,
      host: origin.host,
    });
    msg.error(
      `User added site to blocklist domain, host
        ${origin.domain},
        ${origin.host}`
    );
  }

  useEffect(() => {
    async function getAllowance() {
      try {
        const allowance = await msg.request("getAllowance", {
          domain: origin.domain,
          host: origin.host,
        });
        if (allowance && allowance.enabled) {
          enable();
        }
        setLoading(false);
      } catch (e) {
        if (e instanceof Error) console.error(e.message);
      }
    }

    // Run once.
    if (!hasFetchedData.current) {
      getAllowance();
      hasFetchedData.current = true;
    }
  }, [enable, origin.domain, origin.host]);

  return (
    <div>
      <PublisherCard title={origin.name} image={origin.icon} />

      <div className="text-center p-6">
        <h3 className="text-xl mb-4 dark:text-white">
          Connect with <i>{origin.host}</i>
        </h3>

        <p className="text-gray-500 mb-4 dark:text-neutral-400">
          <strong>{origin.name}</strong> does not have access to your account.
        </p>
        <p className="mb-8 text-gray-500 mb-4 dark:text-neutral-400">
          Do you want to grant them access?
        </p>

        <ConfirmOrCancel label="Enable" onConfirm={enable} onCancel={reject} />

        <a
          className="underline mt-8 text-sm text-gray-500 dark:text-gray-400"
          href="#"
          onClick={block}
        >
          Do not ask for this site again
        </a>
      </div>
    </div>
  );
}

export default Enable;
