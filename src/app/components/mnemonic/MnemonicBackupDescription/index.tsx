import {
  PopiconsLifebuoyLine,
  PopiconsShieldLine,
  PopiconsTriangleExclamationLine,
} from "@popicons/react";
import { Trans, useTranslation } from "react-i18next";
import { classNames } from "~/app/utils";

function MnemonicInstructions() {
  const { t } = useTranslation("translation", {
    keyPrefix: "accounts.account_view.mnemonic",
  });

  return (
    <>
      <div className="flex flex-col gap-4">
        <ListItem
          icon={<PopiconsLifebuoyLine />}
          title={
            <Trans
              i18nKey={"description.recovery_phrase"}
              t={t}
              components={[
                // eslint-disable-next-line react/jsx-key
                <b></b>,
              ]}
            />
          }
          type="info"
        />
        <ListItem
          icon={<PopiconsShieldLine />}
          title={t("description.secure_recovery_phrase")}
          type="info"
        />
        <ListItem
          icon={<PopiconsTriangleExclamationLine />}
          title={
            <Trans
              i18nKey={"description.warning"}
              t={t}
              components={[
                // eslint-disable-next-line react/jsx-key
                <b></b>,
              ]}
            />
          }
          type="warn"
        />
      </div>
    </>
  );
}

export default MnemonicInstructions;

type ListItemProps = {
  icon: React.ReactNode;
  title: string | React.ReactNode;
  type: "warn" | "info";
};

function ListItem({ icon, title, type }: ListItemProps) {
  return (
    <div
      className={classNames(
        type == "warn" && "text-orange-700 dark:text-orange-300",
        type == "info" && "text-gray-600 dark:text-neutral-400",
        "flex gap-2 items-center text-sm"
      )}
    >
      <div className="shrink-0">{icon}</div>
      <span>{title}</span>
    </div>
  );
}
