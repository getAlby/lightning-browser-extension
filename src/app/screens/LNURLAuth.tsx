import ConfirmOrCancel from "@components/ConfirmOrCancel";
import ContentMessage from "@components/ContentMessage";
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
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar justify-between">
      <div>
        <PublisherCard
          title={origin.name}
          image={origin.icon}
          url={details.domain}
        />
        <ContentMessage
          heading={`${origin.name} asks you to login to`}
          content={details.domain}
        />
      </div>
      <div>
        <ConfirmOrCancel label="Login" onConfirm={confirm} onCancel={reject} />
        <p className="mb-4 text-center text-sm text-gray-400">
          <em>{t("only_trusted")}</em>
        </p>
      </div>
    </div>
  );
}

export default LNURLAuth;
