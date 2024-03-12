import {
  PopiconsBookmarkSolid,
  PopiconsChevronBottomLine,
  PopiconsPlusSolid,
  PopiconsWalletSolid,
} from "@popicons/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Avatar from "~/app/components/Avatar";
import MenuDivider from "~/app/components/Menu/MenuDivider";
import SkeletonLoader from "~/app/components/SkeletonLoader";
import { useAccount } from "~/app/context/AccountContext";
import { useAccounts } from "~/app/context/AccountsContext";
import { isAlbyLNDHubAccount, isAlbyOAuthAccount } from "~/app/utils";
import utils from "~/common/lib/utils";

import Menu from "../Menu";

export type Props = {
  showOptions?: boolean;
};

function AccountMenu({ showOptions = true }: Props) {
  const { t } = useTranslation("components", { keyPrefix: "account_menu" });
  const { t: tCommon } = useTranslation("common");

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

  return (
    <div className="relative pl-2 flex justify-end w-72">
      <Menu as="div">
        <Menu.Button className="h-full px-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200">
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
                className="text-sm font-medium text-gray-700 dark:text-neutral-400 text-ellipsis overflow-hidden whitespace-nowrap"
              >
                {accountLoading ? (
                  <SkeletonLoader className="w-20" />
                ) : (
                  title || "⚠️"
                )}
              </div>
            </div>
            <PopiconsChevronBottomLine className="h-5 w-5 dark:text-white" />
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
              <p className="flex justify-between">
                <span className="dark:text-white">
                  {accountLoading ? (
                    <SkeletonLoader className="w-16" />
                  ) : (
                    balancesDecorated.accountBalance
                  )}
                </span>
                <span className="text-gray-500 dark:text-neutral-300">
                  {accountLoading ? (
                    <SkeletonLoader className="w-12" />
                  ) : (
                    balancesDecorated.fiatBalance && (
                      <>~{balancesDecorated.fiatBalance}</>
                    )
                  )}
                </span>
              </p>
            </div>
          </Menu.Item>
          <Menu.ItemButton
            onClick={() => {
              openOptions(`accounts/${authAccount?.id}`);
            }}
          >
            <PopiconsWalletSolid className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300 shrink-0" />
            {t("options.account.wallet_settings")}
          </Menu.ItemButton>
          {(isAlbyLNDHubAccount(
            authAccount?.alias,
            authAccount?.connectorType
          ) ||
            isAlbyOAuthAccount(authAccount?.connectorType)) && (
            <Menu.ItemButton
              onClick={() => {
                window.open(`https://getalby.com/user`, "_blank");
              }}
            >
              <svg
                className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300 shrink-0"
                data-v-52a72b4a=""
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.51 6.617c-.518 1.341-.855 3.245-.855 5.385 0 2.14.337 4.044.856 5.385.26.673.552 1.166.838 1.478.285.312.506.385.651.385.145 0 .366-.073.652-.385.285-.312.577-.805.837-1.478.52-1.341.856-3.245.856-5.385 0-2.14-.337-4.044-.856-5.385-.26-.673-.552-1.166-.838-1.478-.285-.312-.506-.385-.651-.385-.145 0-.366.073-.651.385-.286.312-.578.805-.838 1.478zm-.268-2.49c.455-.499 1.048-.873 1.758-.873s1.303.374 1.758.872c.455.497.83 1.175 1.13 1.95.601 1.553.957 3.649.957 5.926s-.356 4.373-.957 5.926c-.3.774-.675 1.453-1.13 1.95-.455.497-1.048.872-1.758.872s-1.303-.375-1.758-.872c-.455-.497-.83-1.175-1.13-1.95-.601-1.553-.957-3.649-.957-5.926s.356-4.373.957-5.926c.3-.775.675-1.453 1.13-1.95z"
                  clipRule="evenodd"
                ></path>
                <path
                  fillRule="evenodd"
                  d="M12 4.746a7.25 7.25 0 100 14.5 7.25 7.25 0 000-14.5zm-8.75 7.25a8.75 8.75 0 1117.5 0 8.75 8.75 0 01-17.5 0z"
                  clipRule="evenodd"
                ></path>
                <path
                  fillRule="evenodd"
                  d="M3.25 11.99a.75.75 0 01.75-.75l16 .012a.75.75 0 110 1.5l-16-.011a.75.75 0 01-.75-.75z"
                  clipRule="evenodd"
                ></path>
              </svg>
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
                      if (window.location.pathname !== "/prompt.html") {
                        navigate("/");
                      }
                    }}
                    disabled={accountLoading}
                    title={account.name}
                  >
                    <div className="shrink-0">
                      <Avatar
                        size={24}
                        name={account.id}
                        url={account.avatarUrl}
                      />
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
                <PopiconsPlusSolid className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
                {t("options.account.add")}
              </Menu.ItemButton>
              <Menu.ItemButton
                onClick={() => {
                  openOptions("accounts");
                }}
              >
                <PopiconsBookmarkSolid className="h-5 w-5 mr-2 text-gray-700 dark:text-neutral-300" />
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
