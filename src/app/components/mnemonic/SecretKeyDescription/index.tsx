import {
  MnemonicIcon,
  PasswordIcon,
  SafeIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import { useTranslation } from "react-i18next";

function SecretKeyDescription() {
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });

  return (
    <>
      <div className="flex flex-col gap-4">
        <ListItem
          icon={<MnemonicIcon />}
          title={t("backup.items.recovery_phrase")}
        />
        <ListItem icon={<PasswordIcon />} title={t("backup.items.words")} />
        <ListItem icon={<SafeIcon />} title={t("backup.items.storage")} />
      </div>
    </>
  );
}

export default SecretKeyDescription;

type ListItemProps = { icon: React.ReactNode; title: string };

function ListItem({ icon, title }: ListItemProps) {
  return (
    <div className="flex gap-2 items-center">
      <div className="shrink-0 w-8 h-8 text-gray-500 dark:text-neutral-500">
        {icon}
      </div>
      <span className="text-gray-500 dark:text-neutral-500">{title}</span>
    </div>
  );
}
