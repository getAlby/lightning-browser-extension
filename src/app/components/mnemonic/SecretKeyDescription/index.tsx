import { useTranslation } from "react-i18next";
import NostrIcon from "~/app/icons/NostrIcon";

function SecretKeyDescription() {
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });

  return (
    <>
      <p className="text-gray-500 dark:text-neutral-500">
        {t("backup.description1")}
      </p>
      <div className="flex flex-col gap-4">
        <ProtocolListItem
          icon={<NostrIcon className="text-gray-500 dark:text-neutral-500" />}
          title={t("backup.protocols.nostr")}
        />
      </div>

      <p className="mb-8 text-gray-500 dark:text-neutral-500">
        {t("backup.description2")}
      </p>
    </>
  );
}

export default SecretKeyDescription;

type ProtocolListItemProps = { icon: React.ReactNode; title: string };

function ProtocolListItem({ icon, title }: ProtocolListItemProps) {
  return (
    <div className="flex gap-2">
      {icon}
      <span className="text-gray-500 dark:text-neutral-500">{title}</span>
    </div>
  );
}
