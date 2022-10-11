import {
  AddressBookIcon,
  CaretDownIcon,
  PlusIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { CheckIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { WalletIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { useAccounts } from "~/app/context/AccountsContext";
import utils from "~/common/lib/utils";

import Menu from "../Menu";

export type Props = {
  showOptions?: boolean;
};

function AccountMenu({ showOptions = true }: Props) {
  const { t } = useTranslation("components", { keyPrefix: "account_menu" });

  const {
    setAccountId,
    fetchAccountInfo,
    account: authAccount,
    balancesDecorated,
  } = useAccount();
  const navigate = useNavigate();
  const { accounts, getAccounts } = useAccounts();
  const [loading, setLoading] = useState(false);

  // update title
  const title =
    !!authAccount?.name &&
    typeof authAccount?.name === "string" &&
    `${authAccount?.name} - ${authAccount?.alias}`.substring(0, 21);

  useEffect(() => {
    getAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function selectAccount(accountId: string) {
    setLoading(true);
    try {
      setAccountId(accountId);
      await utils.call("selectAccount", {
        id: accountId,
      });
      await fetchAccountInfo({ accountId });
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
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
    <div className="relative pl-2 flex bg-gray-100 rounded-md dark:bg-surface-12dp">
      <p className="flex items-center">
        <WalletIcon className="-ml-1 w-8 h-8 opacity-50 dark:text-white" />
      </p>

      <div
        className={`flex-auto mx-2 py-1 ${
          !title && !balancesDecorated ? "w-28" : ""
        }`}
      >
        <p className="text-xs text-gray-700 dark:text-neutral-400">
          {title || <Skeleton />}
        </p>

        {balancesDecorated.satsBalance ? (
          <p className="flex justify-between">
            <span className="text-xs dark:text-white">
              {balancesDecorated.satsBalance}
            </span>
            {!!balancesDecorated.fiatBalance && (
              <span className="text-xs text-gray-600 dark:text-neutral-400">
                ~{balancesDecorated.fiatBalance}
              </span>
            )}
          </p>
        ) : (
          <Skeleton />
        )}
      </div>

      <Menu as="div">
        <Menu.Button className="h-full px-2 rounded-r-md hover:bg-gray-200 dark:hover:bg-white/10 transition-colors duration-200">
          <CaretDownIcon className="h-4 w-4 dark:text-white" />
          <span className="sr-only">{t("screen_reader")}</span>
        </Menu.Button>

        <Menu.List position="left">
          <Menu.Subheader>{t("title")}</Menu.Subheader>

          {Object.keys(accounts).map((accountId) => {
            const account = accounts[accountId];
            return (
              <Menu.ItemButton
                key={accountId}
                onClick={() => {
                  selectAccount(accountId);
                }}
                disabled={loading}
                title={account.name}
              >
                <WalletIcon className="w-6 h-6 -ml-0.5 mr-2 shrink-0 opacity-75 text-gray-700 dark:text-neutral-300" />
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {account.name}&nbsp;
                </span>
                {accountId === authAccount?.id && (
                  <span
                    data-testid="selected"
                    className="ml-auto w-3.5 h-3.5 rounded-full bg-orange-bitcoin flex justify-center items-center"
                  >
                    <CheckIcon className="w-3 h-3 text-white" />
                  </span>
                )}
              </Menu.ItemButton>
            );
          })}

          {showOptions && (
            <>
              <Menu.Divider />
              <Menu.ItemButton
                onClick={() => {
                  openOptions("accounts/new");
                }}
              >
                <PlusIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
                {t("options.account.add")}
              </Menu.ItemButton>
              <Menu.ItemButton
                onClick={() => {
                  openOptions("accounts");
                }}
              >
                <AddressBookIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
                {t("options.account.manage")}
              </Menu.ItemButton>
            </>
          )}
        </Menu.List>
      </Menu>
    </div>
  );
}

export default AccountMenu;
