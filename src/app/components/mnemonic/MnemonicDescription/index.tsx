import { PopiconsKeyLine } from "@popicons/react";
import { Trans, useTranslation } from "react-i18next";
import FaceSurpriseIcon from "~/app/icons/FaceSurpriseIcon";
import NostrIcon from "~/app/icons/NostrIcon";

function MnemonicDescription() {
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });

  return (
    <>
      <div className="flex flex-col gap-4">
        <ListItem
          icon={<PopiconsKeyLine />}
          title={
            <Trans
              i18nKey={"new.items.keys"}
              t={t}
              components={[
                //eslint-disable-next-line react/jsx-key
                <span className="font-semibold"></span>,
              ]}
            />
          }
        />
        <ListItem
          icon={<FaceSurpriseIcon />}
          title={
            <Trans
              i18nKey={"new.items.usage"}
              t={t}
              components={[
                // eslint-disable-next-line react/jsx-key
                <span className="font-semibold"></span>,
              ]}
            />
          }
        />
        <ListItem icon={<NostrIcon />} title={t("new.items.nostr_key")} />
      </div>
    </>
  );
}

export default MnemonicDescription;

type ListItemProps = {
  icon: React.ReactNode;
  title: string | React.ReactElement;
};

function ListItem({ icon, title }: ListItemProps) {
  return (
    <div className="flex gap-2 items-center text-gray-600 dark:text-neutral-400 text-sm">
      <div className="shrink-0">{icon}</div>
      <span>{title}</span>
    </div>
  );
}
