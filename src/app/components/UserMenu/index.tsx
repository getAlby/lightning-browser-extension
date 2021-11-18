import React from "react";
import { useHistory } from "react-router-dom";
import { CogIcon, LockClosedIcon, TableIcon } from "@heroicons/react/solid";
import { MenuIcon } from "@heroicons/react/outline";
import SendIcon from "@bitcoin-design/bitcoin-icons/svg/filled/send.svg";
import ReceiveIcon from "@bitcoin-design/bitcoin-icons/svg/filled/receive.svg";

import utils from "../../../common/lib/utils";
import Menu from "../Menu";

export default function UserMenu() {
  const history = useHistory();

  function openOptions(path: string) {
    // if we are in the popup
    if (window.location.pathname !== "/options.html") {
      utils.openPage(`options.html#/${path}`);
      // close the popup
      window.close();
    } else {
      history.push(`/${path}`);
    }
  }

  async function lock() {
    try {
      await utils.call("lock");
      window.close();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center text-gray-500 hover:text-black transition-colors duration-200">
        <MenuIcon className="h-6 w-6" aria-hidden="true" />
      </Menu.Button>
      <Menu.List position="right">
        <Menu.ItemButton
          onClick={() => {
            openOptions("publishers");
          }}
        >
          <TableIcon
            className="h-5 w-5 mr-2 text-gray-500"
            aria-hidden="true"
          />
          Websites
        </Menu.ItemButton>
        <Menu.ItemButton
          onClick={() => {
            history.push("/send");
          }}
        >
          <img
            className="w-6 h-6 -ml-0.5 mr-2 opacity-75"
            src={SendIcon}
            alt=""
            aria-hidden="true"
          />
          Send
        </Menu.ItemButton>
        <Menu.ItemButton
          onClick={() => {
            history.push("/receive");
          }}
        >
          <img
            className="w-6 h-6 -ml-0.5 mr-2 opacity-75"
            src={ReceiveIcon}
            alt=""
            aria-hidden="true"
          />
          Receive
        </Menu.ItemButton>
        <Menu.ItemButton
          onClick={() => {
            openOptions("settings");
          }}
        >
          <CogIcon className="h-5 w-5 mr-2 text-gray-500" aria-hidden="true" />
          Settings
        </Menu.ItemButton>
        <Menu.Divider />
        <Menu.ItemButton onClick={lock}>
          <LockClosedIcon
            className="h-5 w-5 mr-2 text-gray-500"
            aria-hidden="true"
          />
          Lock
        </Menu.ItemButton>
      </Menu.List>
    </Menu>
  );
}
