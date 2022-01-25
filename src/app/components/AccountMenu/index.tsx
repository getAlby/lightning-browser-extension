import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WalletIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import {
  CaretDownIcon,
  PlusIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";

import utils from "../../../common/lib/utils";
import { useAuth } from "../../context/AuthContext";

import Badge from "../Badge";
import Menu from "../Menu";

type Accounts = Record<string, { name: string; connector: string }>;

function AccountMenu() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Accounts>({});

  useEffect(() => {
    utils.call<Accounts>("getAccounts").then((response) => {
      setAccounts(response);
    });
  }, []);

  async function selectAccount(accountId: string) {
    auth.setAccountId(accountId);
    await utils.call("selectAccount", {
      id: accountId,
    });
    auth.fetchAccountInfo(accountId);
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
      <Menu.Button className="h-full px-2 rounded-r-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200">
        <CaretDownIcon className="h-4 w-4 dark:text-white" />
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
              <WalletIcon className="w-6 h-6 -ml-0.5 mr-2 opacity-75 text-gray-500" />
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
          <PlusIcon className="h-5 w-5 mr-2 text-gray-500" />
          Add a new account
        </Menu.ItemButton>
      </Menu.List>
    </Menu>
  );
}

export default AccountMenu;
