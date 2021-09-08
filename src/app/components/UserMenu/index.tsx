import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  ChevronDownIcon,
  LockClosedIcon,
  PlusIcon,
  TableIcon,
  UserIcon,
} from "@heroicons/react/solid";
import SendIcon from "@bitcoin-design/bitcoin-icons/svg/filled/send.svg";
import ReceiveIcon from "@bitcoin-design/bitcoin-icons/svg/filled/receive.svg";
import WalletIcon from "@bitcoin-design/bitcoin-icons/svg/outline/wallet.svg";

import utils from "../../../common/lib/utils";
import Menu from "../Menu";
import Badge from "../Badge";

type UserMenuProps = {
  onAccountSwitch?: () => void;
};

export default function UserMenu({ onAccountSwitch }: UserMenuProps) {
  const history = useHistory();
  const [accounts, setAccounts] = useState({});

  useEffect(() => {
    utils.call("getAccounts").then((response) => {
      setAccounts(response);
    });
  }, []);

  async function selectAccount(accountId: string) {
    await utils.call("selectAccount", {
      id: accountId,
    });
    onAccountSwitch && onAccountSwitch();
  }

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
      console.log(e.message);
    }
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center text-gray-500 hover:text-black transition-color duration-200">
        <UserIcon className="h-6 w-6" aria-hidden="true" />
        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
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
          Allowances
        </Menu.ItemButton>
        <Menu.ItemButton
          onClick={() => {
            openOptions("send");
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
            openOptions("receive");
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
        <Menu.Divider />
        <Menu.Subheader>Switch account</Menu.Subheader>
        {Object.keys(accounts).map((accountId) => {
          const account = accounts[accountId];
          return (
            <Menu.ItemButton
              onClick={() => {
                selectAccount(accountId);
              }}
            >
              <img
                className="w-6 h-6 -ml-0.5 mr-2 opacity-75"
                src={WalletIcon}
                alt=""
                aria-hidden="true"
              />
              {account.name}&nbsp;
              <Badge
                label={account.connector}
                color="blue-500"
                textColor="white"
                small
              />
            </Menu.ItemButton>
          );
        })}
        <Menu.ItemButton
          onClick={() => {
            openOptions("accounts/new");
          }}
        >
          <PlusIcon className="h-5 w-5 mr-2 text-gray-500" aria-hidden="true" />
          Add a new account
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
