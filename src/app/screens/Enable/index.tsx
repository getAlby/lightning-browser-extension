import { CheckIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import PublisherCard from "@components/PublisherCard";
import { useState, useEffect, useCallback, useRef } from "react";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import type { OriginData } from "~/types";

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
    event.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  async function block(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    await utils.call("addBlocklist", {
      domain: props.origin.domain,
      host: props.origin.host,
    });
    msg.error(
      `User added site to blocklist domain, host
        ${props.origin.domain},
        ${props.origin.host}`
    );
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
        if (e instanceof Error) console.error(e.message);
      }
    }

    // Run once.
    if (!hasFetchedData.current) {
      getAllowance();
      hasFetchedData.current = true;
    }
  }, [enable, props.origin.domain, props.origin.host]);

  return (
    <div className="flex flex-col h-full">
      <div className="text-center text-xl font-semibold dark:text-white py-2 border-b border-gray-200 dark:border-neutral-500">
        Connect
      </div>
      <div className="h-full">
        <div className="h-2/5 border-b border-gray-200 dark:border-neutral-500">
          <PublisherCard
            title={props.origin.name}
            image={props.origin.icon}
            url={props.origin.location}
          />
        </div>

        <div className="flex flex-col justify-between h-3/5">
          <div className="font-medium dark:text-white p-6">
            <p className="mb-4">This app would like to:</p>

            <div className="mb-4 flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <p className="dark:text-white">
                View your wallet balance & activity
              </p>
            </div>

            <div className="mb-4 flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <p className="dark:text-white">
                Request approval for transactions
              </p>
            </div>

            <a
              className="underline mt-8 text-sm text-gray-500 dark:text-gray-400"
              href="#"
              onClick={block}
            >
              Do not ask for this site again
            </a>
          </div>

          <div className="text-center p-2">
            <ConfirmOrCancel
              label="Connect"
              onConfirm={enable}
              onCancel={reject}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Enable;
