import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import {
  PopiconsCheckLine,
  PopiconsGlassesSolid,
  PopiconsHeartLine,
  PopiconsLikeLine,
} from "@popicons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Alert from "~/app/components/Alert";
import ScreenHeader from "~/app/components/ScreenHeader";
import toast from "~/app/components/Toast";
import { classNames } from "~/app/utils";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import { PermissionPresets, type OriginData } from "~/types";

type Props = {
  origin: OriginData;
};
function NostrEnableComponent(props: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(
    PermissionPresets.REASONABLE
  );
  const hasHttp = props.origin.domain.startsWith("http://");
  const { t } = useTranslation("translation", {
    keyPrefix: "nostr_enable",
  });
  const { t: tCommon } = useTranslation("common");

  const enable = () => {
    try {
      setLoading(true);

      msg.reply({
        enabled: true,
        remember: true,
        preset: selectedCard,
      });
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`${tCommon("error")}: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  function reject(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  async function block(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    await msg.request("addBlocklist", {
      domain: props.origin.domain,
      host: props.origin.host,
    });
    alert(tCommon("enable.block_added", { host: props.origin.host }));
    msg.error(USER_REJECTED_ERROR);
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      <Container justifyBetween maxWidth="sm">
        <div>
          <PublisherCard
            title={props.origin.name}
            image={props.origin.icon}
            url={props.origin.host}
          />

          <div className="pt-3">
            {hasHttp && (
              <Alert type="warn">
                {tCommon("enable.insecure_domain_warn")}
              </Alert>
            )}
          </div>

          <div className="flex flex-col gap-2 dark:text-white pt-6">
            <p className="text-base font-medium">{t("description")}</p>

            <PermissionPreset
              title={t("presets.trust_fully.title")}
              description={t("presets.trust_fully.description")}
              icon={<PopiconsHeartLine className="w-6 h-6" />}
              onClick={() => setSelectedCard(PermissionPresets.TRUST_FULLY)}
              isSelected={selectedCard === PermissionPresets.TRUST_FULLY}
            />
            <PermissionPreset
              title={t("presets.reasonable.title")}
              description={t("presets.reasonable.description")}
              icon={<PopiconsLikeLine className="w-6 h-6" />}
              onClick={() => setSelectedCard(PermissionPresets.REASONABLE)}
              isSelected={selectedCard === PermissionPresets.REASONABLE}
            />
            <PermissionPreset
              title={t("presets.paranoid.title")}
              description={t("presets.reasonable.description")}
              icon={<PopiconsGlassesSolid className="w-6 h-6" />}
              onClick={() => setSelectedCard(PermissionPresets.PARANOID)}
              isSelected={selectedCard === PermissionPresets.PARANOID}
            />
          </div>
        </div>
        <div className="text-center flex flex-col">
          <ConfirmOrCancel
            disabled={loading}
            loading={loading}
            label={tCommon("actions.connect")}
            onConfirm={enable}
            onCancel={reject}
          />
          <a
            className="mt-4 underline text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap"
            href="#"
            onClick={block}
          >
            {tCommon("enable.block_and_ignore", { host: props.origin.host })}
          </a>
        </div>
      </Container>
    </div>
  );
}

type PermissionPresetProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  isSelected: boolean;
};
function PermissionPreset({
  icon,
  title,
  description,
  onClick,
  isSelected,
}: PermissionPresetProps) {
  return (
    <button
      className={classNames(
        "text-left border border-gray-200 dark:border-neutral-800 rounded-xl p-4  text-gray-800 dark:text-neutral-200 cursor-pointer flex flex-row items-center gap-3",
        isSelected
          ? "bg-amber-50 dark:bg-surface-02dp ring-primary border-primary dark:border-primary ring-1"
          : "bg-white dark:bg-surface-01dp hover:bg-gray-50 dark:hover:bg-surface-02dp"
      )}
      onClick={onClick}
    >
      <div
        className={classNames(
          "flex-shrink-0 flex justify-center md:px-3",
          isSelected ? "text-amber-400" : "text-gray-400 dark:text-neutral-600"
        )}
      >
        {icon}
      </div>
      <div className="flex-grow space-y-0.5">
        <div className="font-medium leading-5 text-sm md:text-base">
          {title}
        </div>
        <div className="text-gray-600 dark:text-neutral-400 text-xs leading-4 md:text-sm">
          {description}
        </div>
      </div>
      <div
        className={classNames(
          "flex-shrink-0 flex justify-end text-gray-400 dark:text-neutral-600",
          isSelected ? "" : "hidden"
        )}
      >
        <PopiconsCheckLine className="w-5" />
      </div>
    </button>
  );
}

export default NostrEnableComponent;
