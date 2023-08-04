import {
  GearIcon,
  LockIcon,
  MagicWandIcon,
  MenuIcon,
  RocketIcon,
  WalletIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAccount } from "~/app/context/AccountContext";
import { ConnectedSiteIcon, HelpIcon } from "~/app/icons";
import utils from "~/common/lib/utils";

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
      <Menu.Button className="flex items-center text-gray-700 dark:text-white hover:text-black dark:hover:text-white transition-colors duration-200">
        <MenuIcon className="h-6 w-6" />
      </Menu.Button>
      <Menu.List position="left">
        <div className="lg:hidden">
          <Menu.ItemButton
            onClick={() => {
              openOptions("discover");
            }}
          >
            <RocketIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
            {tCommon("discover")}
          </Menu.ItemButton>
          <Menu.ItemButton
            onClick={() => {
              openOptions("publishers");
            }}
          >
            <ConnectedSiteIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
            {tCommon("connected_sites")}
          </Menu.ItemButton>
          <Menu.ItemButton
            onClick={() => {
              openOptions("wallet");
            }}
          >
            <WalletIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
            {tCommon("wallet")}
          </Menu.ItemButton>
          <Menu.Divider />
        </div>
        <Menu.ItemButton
          onClick={() => {
            openOptions("settings");
          }}
        >
          <GearIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
          {tCommon("settings")}
        </Menu.ItemButton>
        <Menu.ItemButton
          onClick={() => {
            utils.openUrl("https://feedback.getalby.com");
          }}
        >
          <MagicWandIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
          {tCommon("feedback")}
        </Menu.ItemButton>
        <Menu.ItemButton
          onClick={() => {
            utils.openUrl("https://guides.getalby.com");
          }}
        >
          <HelpIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
          {tCommon("help")}
        </Menu.ItemButton>
        <Menu.Divider />
        <Menu.ItemButton onClick={lock}>
          <LockIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
          {tCommon("actions.lock")}
        </Menu.ItemButton>
      </Menu.List>
    </Menu>
  );
}
