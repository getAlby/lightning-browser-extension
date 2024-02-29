import { PopiconsDownloadLine, PopiconsKeyLine } from "@popicons/react";
import { useTranslation } from "react-i18next";
import FaceSurpriseIcon from "~/app/icons/FaceSurpriseIcon";

function MnemonicDescription() {
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });

  return (
    <>
      <div className="flex flex-col gap-6">
        <ListItem icon={<PopiconsKeyLine />} title={t("new.items.keys")} />
        <ListItem icon={<FaceSurpriseIcon />} title={t("new.items.usage")} />
        <ListItem
          icon={<PopiconsDownloadLine />}
          title={t("new.items.recovery_phrase")}
        />
      </div>
    </>
  );
}

export default MnemonicDescription;

type ListItemProps = { icon: React.ReactNode; title: string };

function ListItem({ icon, title }: ListItemProps) {
  return (
    <div className="flex gap-2 items-center text-gray-600 dark:text-neutral-400 text-sm">
      <div className="shrink-0">{icon}</div>
      <span>{title}</span>
    </div>
  );
}
