import ConfirmOrCancel from "@components/ConfirmOrCancel";
import PublisherCard from "@components/PublisherCard";
import { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("components", {
    keyPrefix: "confirmOrCancel",
  });

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
    <div className="h-full flex flex-col justify-between">
      <div>
        <PublisherCard
          title={origin.name}
          image={origin.icon}
          url={details.domain}
        />
        <dl className="m-4 shadow bg-white dark:bg-surface-02dp p-4 rounded-lg">
          <dt className="font-medium mb-1 dark:text-white">
            {origin.name} asks you to login to
          </dt>
          <dd className="text-gray-500 dark:text-gray-400">{details.domain}</dd>
        </dl>
      </div>
      <div>
        <ConfirmOrCancel label="Login" onConfirm={confirm} onCancel={reject} />
        <p className="mb-4 text-center italic text-sm text-gray-400">
          {t("only_trusted")}
        </p>
      </div>
    </div>
  );
}

export default LNURLAuth;
