import {
  AddressBookIcon,
  CaretDownIcon,
  GlobeIcon,
  PlusIcon,
  WalletIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Avatar from "~/app/components/Avatar";
import MenuDivider from "~/app/components/Menu/MenuDivider";
import SkeletonLoader from "~/app/components/SkeletonLoader";
import { useAccount } from "~/app/context/AccountContext";
import { useAccounts } from "~/app/context/AccountsContext";
import { isAlbyAccount } from "~/app/utils";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";

import Menu from "../Menu";

export type Props = {
  showOptions?: boolean;
};

function AccountMenu({ showOptions = true }: Props) {
  const { t } = useTranslation("components", { keyPrefix: "account_menu" });
  const { t: tCommon } = useTranslation("common");

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
    `${authAccount?.name}`;

  useEffect(() => {
    getAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function selectAccount(accountId: string) {
    setLoading(true);
    try {
      await msg.request("selectAccount", {
        id: accountId,
      });
      setAccountId(accountId);
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
    <div className="relative pl-2 flex justify-end w-72">
      <Menu as="div">
        <Menu.Button className="h-full px-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200">
          <div className="flex items-center">
            <Avatar size={24} name={authAccount?.id || ""} />
            <div
              className={`flex-auto mx-2 py-3 overflow-hidden max-w-[14rem] text-left`}
            >
              <div
                title={title || ""}
                className="text-sm font-medium text-gray-700 dark:text-neutral-400 text-ellipsis overflow-hidden whitespace-nowrap"
              >
                {loading ? <SkeletonLoader className="w-20" /> : title || "⚠️"}
              </div>
            </div>
            <CaretDownIcon className="h-4 w-4 dark:text-white" />
            <span className="sr-only">{t("screen_reader")}</span>
          </div>
        </Menu.Button>
        <Menu.List position="right" fullWidth>
          <Menu.Item>
            <div
              className={`flex-auto px-4 py-2 overflow-hidden ${
                !title && !balancesDecorated ? "w-28" : ""
              }`}
            >
              <span className="text-xs text-gray-500 dark:text-neutral-300">
                {tCommon("balance")}
              </span>
              {balancesDecorated.accountBalance ? (
                <p className="flex justify-between">
                  <span className="dark:text-white">
                    {balancesDecorated.accountBalance}
                  </span>
                  {!!balancesDecorated.fiatBalance && (
                    <span className="text-gray-500 dark:text-neutral-300">
                      ~{balancesDecorated.fiatBalance}
                    </span>
                  )}
                </p>
              ) : (
                <SkeletonLoader />
              )}
            </div>
          </Menu.Item>
          <Menu.ItemButton
            onClick={() => {
              openOptions(`accounts/${authAccount?.id}`);
            }}
          >
            <WalletIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
            {t("options.account.account_settings")}
          </Menu.ItemButton>
          {isAlbyAccount(authAccount?.connector) && (
            <Menu.ItemButton
              onClick={() => {
                window.open(`https://getalby.com/user`, "_blank");
              }}
            >
              <GlobeIcon className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
              {t("options.account.go_to_web_wallet")} →
            </Menu.ItemButton>
          )}

          {Object.keys(accounts).length > 1 && (
            <>
              <MenuDivider />
              <Menu.Subheader>{t("title")}</Menu.Subheader>
              {Object.keys(accounts).map((accountId) => {
                // Do not render the current active account
                if (accountId === authAccount?.id) {
                  return;
                }

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
                      <Avatar size={24} name={account.id} />
                    </div>
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap ml-2">
                      {account.name}&nbsp;
                    </span>
                  </Menu.ItemButton>
                );
              })}
            </>
          )}

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
