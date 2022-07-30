import ConfirmOrCancel from "@components/ConfirmOrCancel";
import PublisherCard from "@components/PublisherCard";
import { MouseEvent } from "react";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import type { LNURLAuthServiceResponse } from "~/types";

type Props = {
  details: LNURLAuthServiceResponse;
  origin: {
    name: string;
    icon: string;
  };
};

function LNURLAuth({ details, origin }: Props) {
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
    <div className="h-full">
      <div className="h-2/5 border-b border-gray-200 dark:border-neutral-500">
        <PublisherCard title={origin.name} image={origin.icon} />
      </div>
      <div className="flex flex-col justify-between h-3/5">
        <dl className="m-6 shadow bg-white dark:bg-surface-02dp p-4 rounded-lg">
          <dt className="font-semibold text-gray-500">
            {origin.name} asks you to login to
          </dt>
          <dd className="mb-6 dark:text-white">
            {"https://google.com" + details.domain}
          </dd>
        </dl>
        <div className="text-center p-2">
          <ConfirmOrCancel
            label="Connect"
            onConfirm={confirm}
            onCancel={reject}
          />
        </div>
      </div>
    </div>
  );
}

export default LNURLAuth;
