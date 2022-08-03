import ConfirmOrCancel from "@components/ConfirmOrCancel";
import PublisherCard from "@components/PublisherCard";
import { MouseEvent } from "react";
import { useLocation } from "react-router-dom";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import type { MessageLnUrlAuth } from "~/types";

function LNURLAuth() {
  const location = useLocation();

  const { message } = location.state as { message: MessageLnUrlAuth };
  const { origin } = message;
  const { domain } = message.args;

  async function confirm() {
    return await msg.reply({
      confirmed: true,
      remember: true,
    });
  }

  function reject(e: MouseEvent) {
    e.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  return (
    <div>
      <PublisherCard title={origin.name} image={origin.icon} />
      <div className="p-6">
        <dl className="shadow bg-white dark:bg-surface-02dp p-4 rounded-lg mb-8">
          <dt className="font-semibold text-gray-500">
            {origin.name} asks you to login to
          </dt>
          <dd className="mb-6 dark:text-white">{domain}</dd>
        </dl>
        <ConfirmOrCancel onConfirm={confirm} onCancel={reject} />
      </div>
    </div>
  );
}

export default LNURLAuth;
