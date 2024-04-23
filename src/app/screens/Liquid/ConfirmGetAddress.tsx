import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import { PopiconsCheckLine } from "@popicons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ScreenHeader from "~/app/components/ScreenHeader";
import Checkbox from "~/app/components/form/Checkbox";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import { OriginData } from "~/types";

function LiquidConfirmGetAddress() {
  const { t } = useTranslation("translation", {
    keyPrefix: "liquid",
  });
  const { t: tCommon } = useTranslation("common");
  const { t: tPermissions } = useTranslation("permissions");
  const navState = useNavigationState();
  const origin = navState.origin as OriginData;
  const [loading, setLoading] = useState(false);
  const [rememberPermission, setRememberPermission] = useState(true);

  function confirm() {
    setLoading(true);
    msg.reply({
      confirm: true,
      rememberPermission,
      blocked: false,
    });
    setLoading(false);
  }

  function reject(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  async function block(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    await msg.request("addBlocklist", {
      domain: origin.domain,
      host: origin.host,
    });
    alert(t("block_added", { host: origin.host }));
    msg.error(USER_REJECTED_ERROR);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    confirm();
  }

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

          <div className="dark:text-white pt-6 mb-4">
            <p className="mb-2">{t("allow")}</p>
            <div className="mb-2 flex items-center">
              <PopiconsCheckLine className="w-5 h-5 mr-2" />
              <p className="dark:text-white">
                {tPermissions("liquid.getaddress.description")}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="text-center flex flex-col">
            <div className="flex items-center mb-4">
              <Checkbox
                id="remember_permission"
                name="remember_permission"
                checked={rememberPermission}
                onChange={(event) => {
                  setRememberPermission(event.target.checked);
                }}
              />
              <label
                htmlFor="remember_permission"
                className="cursor-pointer ml-2 block text-sm text-gray-900 font-medium dark:text-white"
              >
                {tCommon("actions.remember")}
              </label>
            </div>
            <ConfirmOrCancel
              disabled={loading}
              loading={loading}
              label={tCommon("actions.confirm")}
              onCancel={reject}
            />
            <a
              className="mt-4 underline text-sm text-gray-400 mx-4 overflow-hidden text-ellipsis whitespace-nowrap"
              href="#"
              onClick={block}
            >
              {t("block_and_ignore", { host: origin.host })}
            </a>
          </div>
        </form>
      </Container>
    </div>
  );
}

export default LiquidConfirmGetAddress;
