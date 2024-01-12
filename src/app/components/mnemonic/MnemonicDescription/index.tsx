import { PopiconsDownloadLine, PopiconsKeyLine } from "@popicons/react";
import { useTranslation } from "react-i18next";
import { useTheme } from "~/app/utils";

function MnemonicDescription() {
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });

  const theme = useTheme();

  return (
    <>
      <div className="flex flex-col gap-4">
        <ListItem icon={<PopiconsKeyLine />} title={t("new.items.keys")} />
        <ListItem
          icon={<img src={`assets/images/face_surprise_${theme}.png`} />}
          title={t("new.items.usage")}
        />
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
    <div className="flex gap-2 items-center">
      <div className="shrink-0 text-gray-600 dark:text-neutral-400">{icon}</div>
      <span className="text-gray-600 text-sm dark:text-neutral-400">
        {title}
      </span>
    </div>
  );
}
