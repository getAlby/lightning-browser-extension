import {
  PopiconsLifebuoyLine,
  PopiconsShieldLine,
  PopiconsTriangleExclamationLine,
} from "@popicons/react";
import { useTranslation } from "react-i18next";
import { classNames } from "~/app/utils";

function MnemonicBackupDescription() {
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });

  return (
    <>
      <div className="flex flex-col gap-4">
        <ListItem
          icon={<PopiconsLifebuoyLine />}
          title={t("backup.items.recovery_phrase")}
          type="info"
        />
        <ListItem
          icon={<PopiconsShieldLine />}
          title={t("backup.items.secure_recovery_phrase")}
          type="info"
        />
        <ListItem
          icon={<PopiconsTriangleExclamationLine />}
          title={t("backup.items.warning")}
          type="warn"
        />
      </div>
    </>
  );
}

export default MnemonicBackupDescription;

type ListItemProps = {
  icon: React.ReactNode;
  title: string;
  type: "warn" | "info";
};

function ListItem({ icon, title, type }: ListItemProps) {
  return (
    <div
      className={classNames(
        type == "warn" && "text-orange-700 dark:text-orange-200",
        type == "info" && "text-gray-600 dark:text-neutral-400",
        "flex gap-2 items-center text-sm"
      )}
    >
      <div className="shrink-0">{icon}</div>
      <span>{title}</span>
    </div>
  );
}
