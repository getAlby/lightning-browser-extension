import Alert from "@components/Alert";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import Checkbox from "@components/form/Checkbox";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useSettings } from "~/app/context/SettingsContext";
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
  const { t: tPermissions } = useTranslation("permissions");
  const { getFormattedSats } = useSettings();

  const navState = useNavigationState();
  const origin = navState.origin as OriginData;
  const requestMethod = navState.args?.requestPermission?.method;
  const description = navState.args?.requestPermission?.description;
  const isFundMoving = navState.args?.requestPermission?.isFundMoving;
  const amount = navState.args?.requestPermission?.amount;
  const destination = navState.args?.requestPermission?.destination;

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    enable();
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      <form onSubmit={handleSubmit} className="h-full">
        <Container justifyBetween maxWidth="sm">
          <div>
            <PublisherCard
              title={origin.name}
              image={origin.icon}
              url={origin.host}
              isSmall={false}
            />
            <div className="dark:text-white pt-4">
              <p className="mb-4">{t("allow")}</p>
              <div className="mb-6 center dark:text-white">
                <p className="font-semibold">{requestMethod}</p>
                {description && (
                  <p className="text-sm text-gray-700 dark:text-neutral-500">
                    {tPermissions(
                      description as unknown as TemplateStringsArray
                    )}
                  </p>
                )}
                {amount !== undefined && (
                  <p className="mt-2 text-sm text-gray-700 dark:text-neutral-400">
                    {t("amount", { amount: getFormattedSats(amount) })}
                  </p>
                )}
                {destination && (
                  <p className="text-sm break-all text-gray-700 dark:text-neutral-400">
                    {t("destination", { destination })}
                  </p>
                )}
              </div>
              {isFundMoving && (
                <Alert type="warn">
                  <p className="text-sm">{t("fund_moving_warning")}</p>
                </Alert>
              )}
            </div>
          </div>
          <div className="text-center flex flex-col">
            {!isFundMoving && (
              <div className="flex items-center mb-4">
                <Checkbox
                  id="always_allow"
                  name="always_allow"
                  checked={alwaysAllow}
                  onChange={() => setAlwaysAllow((prev) => !prev)}
                />
                <label
                  htmlFor="always_allow"
                  className="cursor-pointer pl-2 block text-sm text-gray-900 font-medium dark:text-white"
                >
                  {t("always_allow")}
                </label>
              </div>
            )}
            <ConfirmOrCancel
              label={tCommon("actions.confirm")}
              onCancel={reject}
            />
          </div>
        </Container>
      </form>
    </div>
  );
};

export default ConfirmRequestPermission;
