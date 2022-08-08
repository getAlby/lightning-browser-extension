import { CheckIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import PublisherCard from "@components/PublisherCard";
import { useState, useEffect, useCallback, useRef } from "react";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";

function Enable() {
  const navState = useNavigationState();

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
      domain: navState.origin.domain,
      host: navState.origin.host,
    });
    msg.error(
      `User added site to blocklist domain, host
        ${navState.origin.domain},
        ${navState.origin.host}`
    );
  }

  useEffect(() => {
    async function getAllowance() {
      try {
        const allowance = await msg.request("getAllowance", {
          domain: navState.origin.domain,
          host: navState.origin.host,
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
  }, [enable, navState.origin.domain, navState.origin.host]);

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={"Connect"} />
      <div className="h-full flex flex-col justify-between">
        <div>
          <PublisherCard
            title={navState.origin.name}
            image={navState.origin.icon}
            url={navState.origin.host}
            isSmall={false}
          />

          <div className="dark:text-white p-6">
            <p className="mb-4">Allow {navState.origin.host} to:</p>

            <div className="mb-4 flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <p className="dark:text-white">
                Request approval for transactions
              </p>
            </div>
            <div className="mb-4 flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <p className="dark:text-white">
                Request invoices and lightning information
              </p>
            </div>
          </div>
        </div>
        <div className="mb-4 text-center flex flex-col">
          <ConfirmOrCancel
            label="Connect"
            onConfirm={enable}
            onCancel={reject}
          />
          <a
            className="underline text-sm text-gray-400 mx-4 overflow-hidden text-ellipsis whitespace-nowrap"
            href="#"
            onClick={block}
          >
            Block and ignore {navState.origin.host}
          </a>
        </div>
      </div>
    </div>
  );
}

export default Enable;
