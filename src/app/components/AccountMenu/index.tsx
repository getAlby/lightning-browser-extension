import {
  PopiconsChevronBottomLine,
  PopiconsCirclePlusLine,
  PopiconsGlobeLine,
  PopiconsSettingsMinimalLine,
} from "@popicons/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Avatar from "~/app/components/Avatar";
import SkeletonLoader from "~/app/components/SkeletonLoader";
import { useAccount } from "~/app/context/AccountContext";
import { useAccounts } from "~/app/context/AccountsContext";
import { isAlbyLNDHubAccount, isAlbyOAuthAccount } from "~/app/utils";
import utils from "~/common/lib/utils";

import Modal from "~/app/components/Modal";
import Menu from "../Menu";

export type Props = {
  showOptions?: boolean;
};

function AccountMenu({ showOptions = true }: Props) {
  const { t } = useTranslation("components", { keyPrefix: "account_menu" });
  const { t: tCommon } = useTranslation("common");

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const {
    selectAccount,
    account: authAccount,
    balancesDecorated,
    accountLoading,
  } = useAccount();
  const navigate = useNavigate();
  const { accounts, getAccounts } = useAccounts();

  // update title
  const title =
    !!authAccount?.name &&
    typeof authAccount?.name === "string" &&
    `${authAccount?.name}`;

  useEffect(() => {
    getAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function closeModal() {
    setModalIsOpen(false);
  }

  return (
    <div className="relative flex justify-end w-80 text-gray-800 dark:text-neutral-200">
      {window.location.pathname == "/options.html" ? (
        <Menu as="div">
          <Menu.Button className="h-full px-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200">
            <MenuHeader />
          </Menu.Button>
          <Menu.List position="right" width="w-[352px]">
            <ListItem />
          </Menu.List>
        </Menu>
      ) : (
        <>
          <button
            className="h-full px-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200"
            onClick={() => {
              setModalIsOpen(true);
            }}
          >
            <MenuHeader />
          </button>
          <Modal
            isOpen={modalIsOpen}
            close={closeModal}
            contentLabel={t("select_wallet")}
            position="center"
            padding={showOptions ? "p-0" : "pb-3"}
          >
            <Menu as="div">
              <ListItem isPrompt={true} />
            </Menu>
          </Modal>
        </>
      )}
    </div>
  );

  function MenuHeader() {
    return (
      <div className="flex items-center">
        {accountLoading ? (
          <SkeletonLoader
            className="rounded-full w-6 h-6 overflow-hidden"
            containerClassName="inline-flex"
          />
        ) : (
          <Avatar
            size={24}
            url={authAccount?.avatarUrl}
            name={authAccount?.id || ""}
          />
        )}
        <div
          className={`flex-auto mx-2 py-3 overflow-hidden max-w-[10rem] text-left`}
        >
          <div
            title={title || ""}
            className="text-sm font-medium text-ellipsis overflow-hidden whitespace-nowrap"
          >
            {accountLoading ? (
              <SkeletonLoader className="w-20" />
            ) : (
              title || "⚠️"
            )}
          </div>
        </div>
        <PopiconsChevronBottomLine className="h-4 w-4" />
        <span className="sr-only">{t("screen_reader")}</span>
      </div>
    );
  }

  function ActiveAccount() {
    return (
      authAccount && (
        <div className="p-2 overflow-hidden">
          <div className="flex flex-row items-center justify-between gap-2 bg-amber-50 dark:bg-brand-yellow/50 border-brand-yellow border-l-4 p-3">
            <div className="flex flex-row items-center gap-2 overflow-hidden">
              <div className="shrink-0">
                <Avatar
                  size={24}
                  name={authAccount.id}
                  url={authAccount.avatarUrl}
                />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">
                  {authAccount.name}
                </span>
                <span className="text-gray-600 text-xs">
                  {accountLoading ? (
                    <SkeletonLoader className="w-16" />
                  ) : (
                    balancesDecorated.accountBalance
                  )}
                </span>
              </div>
            </div>
            <div className="flex flex-row gap-1 items-center">
              {(isAlbyLNDHubAccount(
                authAccount.alias,
                authAccount.connectorType
              ) ||
                isAlbyOAuthAccount(authAccount.connectorType)) && (
                <a
                  className="cursor-pointer text-gray-600 dark:text-neutral-400 hover:text-gray-400 dark:hover:text-neutral-600"
                  onClick={() => {
                    window.open(`https://getalby.com/user`, "_blank");
                  }}
                  title={t("options.account.go_to_web_wallet")}
                >
                  <PopiconsGlobeLine className="w-5 h-5 mr-2 shrink-0" />
                </a>
              )}
              <a
                className="cursor-pointer text-gray-600 dark:text-neutral-400 hover:text-gray-400 dark:hover:text-neutral-600"
                title={tCommon("wallet_settings")}
                onClick={() => {
                  openOptions(`accounts/${authAccount.id}`);
                }}
              >
                <PopiconsSettingsMinimalLine className="w-5 h-5 mr-2 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      )
    );
  }

  type ListItemProps = {
    isPrompt?: boolean;
  };

  function ListItem({ isPrompt }: ListItemProps) {
    return (
      <>
        <p className="flex justify-center text-lg dark:text-white p-3 font-semibold">
          {t("select_wallet")}
        </p>
        {authAccount && (
          <Menu.Item>
            <ActiveAccount />
          </Menu.Item>
        )}
        {Object.keys(accounts).length > 1 && (
          <>
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
                    if (window.location.pathname !== "/prompt.html") {
                      navigate("/");
                    }
                    if (isPrompt) {
                      closeModal();
                    }
                  }}
                  disabled={accountLoading}
                  title={account.name}
                >
                  <div className="flex flex-row w-full items-center">
                    <div className="shrink-0">
                      <Avatar
                        size={24}
                        name={account.id}
                        url={account.avatarUrl}
                      />
                    </div>
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap ml-2 text-gray-600 dark:text-neutral-400">
                      {account.name}
                    </span>
                  </div>
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
              <PopiconsCirclePlusLine className="h-4 w-4 mr-2 shrink-0" />
              <span>{t("options.account.connect_wallet")}</span>
            </Menu.ItemButton>
          </>
        )}
      </>
    );
  }
}

export default AccountMenu;
