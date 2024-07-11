import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAccount } from "~/app/context/AccountContext";
import { ConnectedSiteIcon } from "~/app/icons";
import utils from "~/common/lib/utils";

import {
  PopiconsBarsSolid,
  PopiconsBulbLine,
  PopiconsCogLine,
  PopiconsCommentLine,
  PopiconsExpandLine,
  PopiconsLockLine,
} from "@popicons/react";
import Menu from "../Menu";

export default function UserMenu() {
  const navigate = useNavigate();
  const auth = useAccount();
  const { t: tCommon } = useTranslation("common");

  function openOptions(path: string) {
    // if we are in the popup
    if (window.location.pathname !== "/options.html") {
      utils.openPage(`options.html#/${path}`);
      // close the popup
      window.close();
    } else {
      navigate(`/${path}`);
    }
  }

  async function lock() {
    try {
      auth.lock(() => {
        window.close();
      });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center text-gray-800 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors duration-200">
        <PopiconsBarsSolid className="h-5 w-5" />
      </Menu.Button>
      <Menu.List position="left">
        <div className="lg:hidden">
          <Menu.ItemButton
            onClick={() => {
              openOptions("wallet");
            }}
          >
            <PopiconsExpandLine className="h-5 w-5 mr-2 text-gray-800 dark:text-neutral-200 shrink-0" />
            {tCommon("full_screen")}
          </Menu.ItemButton>
          <Menu.ItemButton
            onClick={() => {
              openOptions("publishers");
            }}
          >
            <ConnectedSiteIcon className="h-5 w-5 mr-2 text-gray-800 dark:text-neutral-200 shrink-0" />
            {tCommon("connected_sites")}
          </Menu.ItemButton>
        </div>
        <Menu.ItemButton
          onClick={() => {
            openOptions("settings");
          }}
        >
          <PopiconsCogLine className="h-5 w-5 mr-2 text-gray-800 dark:text-neutral-200 shrink-0" />
          {tCommon("settings")}
        </Menu.ItemButton>
        <Menu.ItemButton
          onClick={() => {
            utils.openUrl("https://feedback.getalby.com");
          }}
        >
          <PopiconsCommentLine className="h-5 w-5 mr-2 text-gray-800 dark:text-neutral-200 shrink-0" />
          {tCommon("feedback")}
        </Menu.ItemButton>

        <Menu.ItemButton
          onClick={() => {
            utils.openUrl(
              "https://guides.getalby.com/user-guide/v/alby-account-and-browser-extension/"
            );
          }}
        >
          <PopiconsBulbLine className="h-5 w-5 mr-2 text-gray-800 dark:text-neutral-200 shrink-0" />
          {tCommon("help")}
        </Menu.ItemButton>

        <Menu.ItemButton onClick={lock}>
          <PopiconsLockLine className="h-5 w-5 mr-2 text-gray-800 dark:text-neutral-200 shrink-0" />
          {tCommon("actions.lock")}
        </Menu.ItemButton>
      </Menu.List>
    </Menu>
  );
}
