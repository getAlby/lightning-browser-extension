import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import Button from "~/app/components/Button";
import Modal from "~/app/components/Modal";
import PublisherCard from "~/app/components/PublisherCard";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { OriginData } from "~/types";

type PermissionOption = "ask_everytime" | "dont_ask_current" | "dont_ask_any";

type Props = {
  onClose: () => void;
  isOpen: boolean;
  permssionCallback: (permission: PermissionOption) => void;
  permission: PermissionOption;
};

export default function PermissionModal({
  isOpen,
  onClose,
  permssionCallback,
  permission,
}: Props) {
  const { t: tCommon } = useTranslation("common");

  const { t } = useTranslation("components", {
    keyPrefix: "permissions_modal",
  });

  const navState = useNavigationState();
  const [permissionOption, setPermissionOption] = useState("ask_everytime");
  const origin = navState.origin as OriginData;

  return (
    <Modal
      isOpen={isOpen}
      close={() => {
        onClose();
      }}
      contentLabel={t("content_label")}
      position="top"
    >
      <div className="dark:text-white mt-6">
        <PublisherCard
          title={origin.name}
          image={origin.icon}
          url={origin.host}
          isSmall={false}
          isCard={false}
        />
        <div className="flex flex-col gap-2 py-1">
          <p className="text-md">{t("set_permissions")}</p>

          <div className="flex flex-col gap-1">
            <ListItem checkedValue="ask_everytime" />
            <ListItem checkedValue="dont_ask_current" />
            <ListItem checkedValue="dont_ask_any" />
          </div>
          <div className="flex">
            <Button
              label={tCommon("actions.save")}
              primary
              flex
              onClick={() =>
                permssionCallback(permissionOption as PermissionOption)
              }
            />
          </div>
        </div>
      </div>
    </Modal>
  );

  type ListItemProps = {
    checkedValue: PermissionOption;
  };

  function ListItem({ checkedValue }: ListItemProps) {
    return (
      <div className="flex flex-row gap-2 items-center py-1">
        <input
          type="radio"
          id={checkedValue}
          name="permission"
          value="permission"
          checked={permissionOption === checkedValue}
          onChange={() => {
            setPermissionOption(checkedValue);
          }}
          className="bg-white dark:bg-surface-01dp border border-gray-200 dark:border-neutral-700 cursor-pointer text-primary focus:ring-0 focus:ring-offset-0"
        />
        <label
          htmlFor={checkedValue}
          className="text-sm text-gray-600 dark:text-neutral-400 cursor-pointer"
        >
          <Trans
            i18nKey={checkedValue}
            t={t}
            values={{ permission }}
            components={[
              // eslint-disable-next-line react/jsx-key
              <b></b>,
            ]}
          />
        </label>
      </div>
    );
  }
}
