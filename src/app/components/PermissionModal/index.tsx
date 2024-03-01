import { useState } from "react";
import { useTranslation } from "react-i18next";
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

  const navState = useNavigationState();
  const [permissionOption, setPermissionOption] = useState("ask_every_time");
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
        <ul className="m-4 flex flex-col gap-4">
          <li className="flex gap-4 items-center">
            <input
              type="radio"
              id="mode-companion"
              name="mode"
              value="companion"
              checked={permissionOption === "ask_every_time"}
              onChange={() => {
                setPermissionOption("ask_every_time");
              }}
            />
            <label
              htmlFor="mode-companion"
              className="inline-flex justify-between text-sm text-gray-500 cursor-pointer dark:hover:text-gray-300 dark:peer-checked:text-primary peer-checked:border-primary peer-checked:text-primary hover:text-gray-600 dark:text-gray-400 "
            >
              {`Ask everytime for ${permission}`}
            </label>
          </li>

          <li className="flex gap-4 items-center">
            <input
              type="radio"
              id="mode-companion"
              name="mode"
              value="companion"
              checked={permissionOption === "dont_ask_again_current"}
              onChange={() => {
                setPermissionOption("dont_ask_again_current");
              }}
            />
            <label
              htmlFor="mode-companion"
              className="inline-flex justify-between text-sm  text-gray-500 cursor-pointer dark:hover:text-gray-300 dark:peer-checked:text-primary peer-checked:border-primary peer-checked:text-primary hover:text-gray-600 dark:text-gray-400 "
            >
              {`Don't ask again for ${permission}`}
            </label>
          </li>
          <li className="flex gap-4 items-center">
            <input
              type="radio"
              id="mode-companion"
              name="mode"
              value="companion"
              checked={permissionOption === "dont_ask_again_all"}
              onChange={() => {
                setPermissionOption("dont_ask_again_all");
              }}
            />
            <label
              htmlFor="mode-companion"
              className="inline-flex justify-between text-sm  text-gray-500 cursor-pointer dark:hover:text-gray-300 dark:peer-checked:text-primary peer-checked:border-primary peer-checked:text-primary hover:text-gray-600 dark:text-gray-400 "
            >
              {`Don't ask again for any Nostr Requests`}
            </label>
          </li>
        </ul>

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
}
