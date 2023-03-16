import {
  AddressBookIcon,
  GearIcon,
  GlobeIcon,
  LockIcon,
  MenuIcon,
  QuestionIcon,
  ReceiveIcon,
  RocketIcon,
  SendIcon,
  TransactionsIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAccount } from "~/app/context/AccountContext";
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
        <Menu.ItemButton
          onClick={() => {
            openOptions("discover");
          }}
        >
          <GlobeIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
          {tCommon("discover")}
        </Menu.ItemButton>
        <Menu.ItemButton
          onClick={() => {
            openOptions("publishers");
          }}
        >
          <TransactionsIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
          {tCommon("websites")}
        </Menu.ItemButton>
        <Menu.ItemButton
          onClick={() => {
            navigate("/send");
          }}
        >
          <SendIcon className="w-6 h-6 -ml-0.5 mr-2 text-gray-700 dark:text-neutral-300" />
          {tCommon("actions.send")}
        </Menu.ItemButton>
        <Menu.ItemButton
          onClick={() => {
            navigate("/receive");
          }}
        >
          <ReceiveIcon className="w-6 h-6 -ml-0.5 mr-2 text-gray-700 dark:text-neutral-300" />
          {tCommon("actions.receive")}
        </Menu.ItemButton>
        <Menu.ItemButton
          onClick={() => {
            openOptions("transactions");
          }}
        >
          <TransactionsIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
          {tCommon("transactions")}
        </Menu.ItemButton>
        <Menu.Divider />
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
            openOptions("accounts");
          }}
        >
          <AddressBookIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
          {tCommon("accounts")}
        </Menu.ItemButton>
        <Menu.ItemButton
          onClick={() => {
            utils.openUrl("https://feedback.getalby.com");
          }}
        >
          <RocketIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
          {tCommon("feedback")}
        </Menu.ItemButton>
        <Menu.ItemButton
          onClick={() => {
            utils.openUrl("https://guides.getalby.com");
          }}
        >
          <QuestionIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
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
