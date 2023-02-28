import {
  AddressBookIcon,
  CaretDownIcon,
  CheckIcon,
  PlusIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Avatar from "~/app/components/Avatar";
import { useAccount } from "~/app/context/AccountContext";
import { useAccounts } from "~/app/context/AccountsContext";
import msg from "~/common/lib/msg";
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
    `${authAccount?.name} - ${authAccount?.alias}`;

  useEffect(() => {
    getAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function selectAccount(accountId: string) {
    setLoading(true);
    try {
      setAccountId(accountId);
      await msg.request("selectAccount", {
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
    <div className="relative pl-2 w-72 flex bg-gray-100 rounded-md dark:bg-surface-12dp">
      <div className="flex items-center">
        <Avatar size={32} name={authAccount?.name || ""} />
      </div>

      <div
        className={`flex-auto mx-2 py-1 overflow-hidden ${
          !title && !balancesDecorated ? "w-28" : ""
        }`}
      >
        <p
          title={title || ""}
          className="text-xs text-gray-700 dark:text-neutral-400 text-ellipsis overflow-hidden whitespace-nowrap"
        >
          {title || <Skeleton />}
        </p>

        {balancesDecorated.accountBalance ? (
          <p className="flex justify-between">
            <span className="text-xs dark:text-white">
              {balancesDecorated.accountBalance}
            </span>
            {!!balancesDecorated.fiatBalance && (
              <span className="text-xs text-gray-600 dark:text-neutral-400 ml-2">
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

        <Menu.List position="left" fullWidth>
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
                <div className="shrink-0">
                  <Avatar size={32} name={account.name} />
                </div>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap ml-2">
                  {account.name}&nbsp;
                </span>
                {accountId === authAccount?.id && (
                  <span
                    data-testid="selected"
                    className="ml-auto flex-shrink-0 w-3.5 h-3.5 rounded-full bg-orange-bitcoin flex justify-center items-center"
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
