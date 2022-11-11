import { CheckIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import Checkbox from "@components/form/Checkbox";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import type { OriginData } from "~/types";

const ConfirmRequestPermission: FC = () => {
  const [alwaysAllow, setAlwaysAllow] = useState(false);

  const { t } = useTranslation("translation", {
    keyPrefix: "confirm_request_permission",
  });
  const { t: tCommon } = useTranslation("common");

  const navState = useNavigationState();
  const origin = navState.origin as OriginData;
  const requestMethod = navState.args?.requestPermission?.method;

  const enable = () => {
    msg.reply({
      enabled: alwaysAllow,
      blocked: false,
    });
  };

  const reject = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      <Container justifyBetween maxWidth="sm">
        <div>
          <PublisherCard
            title={origin.name}
            image={origin.icon}
            url={origin.host}
            isSmall={false}
          />

          <div className="dark:text-white pt-6">
            <p className="mb-4">{t("allow", { host: origin.host })}</p>
            <div className="mb-4 flex items-center">
              <CheckIcon className="w-5 h-5 mr-2" />
              <p className="dark:text-white">
                {t("enable_method", { method: requestMethod })}
              </p>
            </div>
            <div className="flex items-center">
              <Checkbox
                id="always_allow"
                name="always_allow"
                checked={alwaysAllow}
                onChange={() => setAlwaysAllow((prev) => !prev)}
              />
              <label
                htmlFor="always_allow"
                className="cursor-pointer ml-2 block text-sm text-gray-900 font-medium dark:text-white"
              >
                {t("always_allow", { method: requestMethod })}
              </label>
            </div>
          </div>
        </div>
        <div className="mb-4 text-center flex flex-col">
          <ConfirmOrCancel
            label={tCommon("actions.confirm")}
            onConfirm={enable}
            onCancel={reject}
          />
        </div>
      </Container>
    </div>
  );
};

export default ConfirmRequestPermission;
