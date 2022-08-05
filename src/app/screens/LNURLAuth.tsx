import ConfirmOrCancel from "@components/ConfirmOrCancel";
import PublisherCard from "@components/PublisherCard";
import { MouseEvent } from "react";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import type { LNURLAuthServiceResponse, OriginData } from "~/types";

function LNURLAuth() {
  const navState = useNavigationState();
  const origin: OriginData = navState.origin;
  const details = navState.args.lnurlDetails as LNURLAuthServiceResponse;

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
          <dd className="mb-6 dark:text-white">{details.domain}</dd>
        </dl>
        <ConfirmOrCancel onConfirm={confirm} onCancel={reject} />
      </div>
    </div>
  );
}

export default LNURLAuth;
