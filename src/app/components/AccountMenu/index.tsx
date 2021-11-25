import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WalletIcon from "@bitcoin-design/bitcoin-icons/svg/outline/wallet.svg";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/solid";

import utils from "../../../common/lib/utils";

import Badge from "../Badge";
import Menu from "../Menu";

type Props = {
  onAccountSwitch?: () => void;
};

function AccountMenu({ onAccountSwitch }: Props) {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<{
    [key: string]: { name: "string"; connector: "string" };
  }>({});

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
      navigate(`/${path}`);
    }
  }

  return (
    <Menu as="div">
      <Menu.Button className="h-full px-2 rounded-r-md hover:bg-gray-200 transition-colors duration-200">
        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
      </Menu.Button>
      <Menu.List position="left">
        <Menu.Subheader>Switch account</Menu.Subheader>
        {Object.keys(accounts).map((accountId) => {
          const account = accounts[accountId];
          return (
            <Menu.ItemButton
              key={accountId}
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
      </Menu.List>
    </Menu>
  );
}

export default AccountMenu;
