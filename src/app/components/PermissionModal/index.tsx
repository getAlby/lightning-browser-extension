import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import Button from "~/app/components/Button";
import Modal from "~/app/components/Modal";
import PublisherCard from "~/app/components/PublisherCard";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { OriginData } from "~/types";

type Props = {
  onClose: () => void;
  isOpen: boolean;
  PermssionCallback: (permission: string) => void;
  permission: string;
};

export default function PermissionModal({
  isOpen,
  onClose,
  PermssionCallback,
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
      contentLabel={"Transactions"}
      position="top"
    >
      <div className="dark:text-white">
        <PublisherCard
          title={origin.name}
          image={origin.icon}
          url={origin.host}
          isSmall={false}
          isCard={false}
        />
        <div className="m-4 flex flex-col gap-4">
          <p className="text-sm font-bold">{t("set_permissions")}</p>

          <ListItem checkedValue="ask_everytime" />
          <ListItem checkedValue="dont_ask_current" />
          <ListItem checkedValue="dont_ask_any" />
        </div>

        <div className="flex justify-center mt-6 w-64 mx-auto">
          <Button
            label={tCommon("actions.save")}
            primary
            flex
            onClick={() => PermssionCallback(permissionOption)}
          />
        </div>
      </div>
    </Modal>
  );

  type ListItemProps = {
    checkedValue: "ask_everytime" | "dont_ask_current" | "dont_ask_any";
  };

  function ListItem({ checkedValue }: ListItemProps) {
    return (
      <div className="flex flex-row gap-4 items-center">
        <input
          type="radio"
          id="set-permission"
          name="permission"
          value="permission"
          checked={permissionOption === checkedValue}
          onChange={() => {
            setPermissionOption(checkedValue);
          }}
        />
        <label
          htmlFor="set-permission"
          className="text-sm text-gray-500 cursor-pointer dark:hover:text-gray-300 dark:peer-checked:text-primary peer-checked:border-primary peer-checked:text-primary hover:text-gray-600 dark:text-gray-400 "
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
