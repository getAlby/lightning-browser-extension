import Button from "@components/Button";
import Loading from "@components/Loading";
import TransactionsTable from "@components/TransactionsTable";
import {
  PopiconsArrowDownLine,
  PopiconsArrowRightLine,
  PopiconsBulbLine,
  PopiconsCircleExclamationLine,
  PopiconsKeyLine,
  PopiconsOstrichSolid,
} from "@popicons/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FC, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Alert from "~/app/components/Alert";
import BalanceBox from "~/app/components/BalanceBox";
import Hyperlink from "~/app/components/Hyperlink";
import { IconLinkCard } from "~/app/components/IconLinkCard/IconLinkCard";
import toast from "~/app/components/Toast";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { useTransactions } from "~/app/hooks/useTransactions";
import { PublisherLnData } from "~/app/screens/Home/PublisherLnData";
import { isAlbyLNDHubAccount } from "~/app/utils";
import api, { GetAccountRes } from "~/common/lib/api";
import msg from "~/common/lib/msg";
import { default as nostr } from "~/common/lib/nostr";
import utils from "~/common/lib/utils";
import type { Battery } from "~/types";

dayjs.extend(relativeTime);

export type Props = {
  lnDataFromCurrentTab?: Battery[];
  currentUrl?: URL | null;
  renderPublisherWidget?: boolean;
};

const DefaultView: FC<Props> = (props) => {
  const itemsLimit = 8;

  const { t } = useTranslation("translation", { keyPrefix: "home" });
  const { t: tCommon } = useTranslation("common");

  const navigate = useNavigate();

  const { getFormattedSats } = useSettings();

  const { account, accountLoading } = useAccount();

  const lightningAddress = account?.lightningAddress || "";

  const [isBlockedUrl, setIsBlockedUrl] = useState<boolean>(false);
  const [currentAccount, setCurrentAccount] = useState<GetAccountRes>();
  const [nostrPublicKey, setNostrPublicKey] = useState("");

  const { transactions, isLoadingTransactions, loadTransactions } =
    useTransactions();

  const isLoading = accountLoading || isLoadingTransactions;
  const needsKeySetup =
    !currentAccount?.hasMnemonic || !currentAccount?.isMnemonicBackupDone;

  useEffect(() => {
    loadTransactions(itemsLimit);
  }, [loadTransactions, itemsLimit, account?.id]);

  // check if currentURL is blocked
  useEffect(() => {
    const checkBlockedUrl = async (host: string) => {
      const { blocked } = await api.getBlocklist(host);
      setIsBlockedUrl(blocked);
    };

    if (props.currentUrl?.host) {
      checkBlockedUrl(props.currentUrl.host);
    }
  }, [props.currentUrl]);

  useEffect(() => {
    (async () => {
      try {
        const userAccount = await api.getAccount();
        const nostrPrivateKey = await api.nostr.getPrivateKey(userAccount.id);

        setNostrPublicKey(
          nostrPrivateKey ? await nostr.derivePublicKey(nostrPrivateKey) : ""
        );
        setCurrentAccount(userAccount);
      } catch (e) {
        console.error(e);
        if (e instanceof Error) toast.error(`Error: ${e.message}`);
      }
    })();
  }, [account]);

  const unblock = async () => {
    try {
      if (props.currentUrl?.host) {
        await msg.request("deleteBlocklist", {
          host: props.currentUrl.host,
        });
        toast.success(
          t("default_view.block_removed", { host: props.currentUrl.host })
        );
      }
      setIsBlockedUrl(false);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    }
  };

  function handleViewAllLink(path: string) {
    // if we are in the popup
    if (window.location.pathname !== "/options.html") {
      utils.openPage(`options.html#${path}`);
    } else {
      navigate(path);
    }
  }

  function openOptions(path: string) {
    utils.openPage(`options.html#/${path}`);
  }

  return (
    <div className="w-full max-w-screen-sm h-full mx-auto overflow-y-auto no-scrollbar">
      {props.renderPublisherWidget && !!props.lnDataFromCurrentTab?.length && (
        <PublisherLnData lnData={props.lnDataFromCurrentTab[0]} />
      )}

      <div className="flex flex-col gap-4 p-4">
        {isBlockedUrl && (
          <div className="items-center dark:text-white text-sm">
            <Alert type="info">
              <p className="pb-2">
                {t("default_view.is_blocked_hint", {
                  host: props.currentUrl?.host,
                })}
              </p>
              <Button
                fullWidth
                label={t("actions.enable_now")}
                direction="column"
                onClick={() => unblock()}
              />
            </Alert>
          </div>
        )}

        {isAlbyLNDHubAccount(account?.alias, account?.connectorType) && (
          <Alert type="info">
            <div className="flex gap-2 items-center">
              <div className="shrink-0">
                <PopiconsCircleExclamationLine className="w-5 h-5" />
              </div>
              <span className="text-sm">
                <Trans
                  i18nKey={"default_view.upgrade_account"}
                  t={t}
                  components={[
                    // eslint-disable-next-line react/jsx-key
                    <a
                      className="underline"
                      href="https://guides.getalby.com/user-guide/v/alby-account-and-browser-extension/alby-browser-extension/migrate-from-old-lndhub-setup"
                      target="_blank"
                      rel="noreferrer"
                    />,
                  ]}
                />
              </span>
            </div>
          </Alert>
        )}

        {account?.sharedNode && (
          <Alert type="info">
            <div className="flex items-center gap-2">
              <div className="shrink-0">
                <PopiconsCircleExclamationLine className="w-5 h-5" />
              </div>
              <span className="text-sm">
                <Trans
                  i18nKey={"default_view.using_shared_node"}
                  t={t}
                  components={[
                    // eslint-disable-next-line react/jsx-key
                    <Hyperlink
                      className="underline"
                      href="https://getalby.com/node/embrace_albyhub"
                      target="_blank"
                      rel="noopener nofollow"
                    />,
                  ]}
                />
              </span>
            </div>
          </Alert>
        )}

        {account?.usingFeeCredits && (
          <Alert type="info">
            <div className="flex items-center gap-2">
              <div className="shrink-0">
                <PopiconsCircleExclamationLine className="w-5 h-5" />
              </div>
              <span className="text-sm">
                <Trans
                  i18nKey={"default_view.using_fee_credits"}
                  t={t}
                  values={{
                    max_account_balance: getFormattedSats(
                      account?.limits?.max_account_balance || 0
                    ),
                  }}
                  components={[
                    // eslint-disable-next-line react/jsx-key
                    <Hyperlink
                      className="underline"
                      href="https://getalby.com/onboarding/node/new"
                      target="_blank"
                      rel="noopener nofollow"
                    />,
                    // eslint-disable-next-line react/jsx-key
                    <Hyperlink
                      className="underline"
                      href="https://guides.getalby.com/user-guide/alby-account-and-browser-extension/alby-account/faqs-alby-account/what-are-fee-credits-in-my-alby-account"
                      target="_blank"
                      rel="noopener nofollow"
                    />,
                  ]}
                />
              </span>
            </div>
          </Alert>
        )}

        {account?.nodeRequired ? (
          <Alert type="info">
            <div className="flex items-center gap-2">
              <div className="shrink-0">
                <PopiconsCircleExclamationLine className="w-5 h-5" />
              </div>
              <span className="text-sm">
                <Trans
                  i18nKey={"node_required"}
                  t={tCommon}
                  components={[
                    // eslint-disable-next-line react/jsx-key
                    <Hyperlink
                      className="underline"
                      href="https://getalby.com/onboarding/node/new"
                      target="_blank"
                      rel="noopener nofollow"
                    />,

                    // eslint-disable-next-line react/jsx-key
                    <Hyperlink
                      className="underline"
                      href="https://guides.getalby.com/user-guide/alby-account-and-browser-extension/alby-account/faqs-alby-account/what-are-fee-credits-in-my-alby-account"
                      target="_blank"
                      rel="noopener nofollow"
                    />,
                  ]}
                />
              </span>
            </div>
          </Alert>
        ) : (
          <BalanceBox />
        )}

        {(lightningAddress || nostrPublicKey) && (
          <div className="flex justify-center gap-3 mb-2">
            {lightningAddress && (
              <a
                className="relative group cursor-pointer flex flex-row items-center p-1 bg-white dark:bg-surface-01dp border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-white rounded-full text-xs font-medium hover:border-primary hover:bg-yellow-50 dark:hover:border-primary dark:hover:dark:bg-surface-16dp transition-all duration-250 select-none"
                onClick={() => {
                  navigator.clipboard.writeText(lightningAddress);
                  toast.success(tCommon("actions.copied_to_clipboard"));
                }}
              >
                <img src="assets/icons/popicons/bolt.svg" className="w-5 h-5" />
                <span className="max-w-64 hidden group-hover:block truncate mr-1">
                  {lightningAddress}
                </span>
              </a>
            )}

            {nostrPublicKey && (
              <a
                className="relative group cursor-pointer flex flex-row items-center p-1 bg-white dark:bg-surface-01dp border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-white rounded-full text-xs font-medium hover:border-primary hover:bg-yellow-50 dark:hover:border-primary dark:hover:dark:bg-surface-16dp transition-all duration-250 select-none"
                onClick={() => {
                  navigator.clipboard.writeText(nostrPublicKey);
                  toast.success(tCommon("actions.copied_to_clipboard"));
                }}
              >
                <PopiconsOstrichSolid className="w-5 h-5 text-purple-500" />
                <span className="max-w-64 hidden group-hover:block truncate mr-1">
                  {nostrPublicKey.substring(0, 11)}
                  ...
                  {nostrPublicKey.substring(nostrPublicKey.length - 11)}
                </span>
              </a>
            )}
          </div>
        )}

        <div className="flex space-x-3 justify-between">
          <HomeButton
            icon={<img src="assets/icons/popicons/receive.svg" />}
            onClick={() => {
              navigate("/receive");
            }}
          >
            {tCommon("actions.receive")}
          </HomeButton>
          <HomeButton
            icon={<img src="assets/icons/popicons/send.svg" />}
            onClick={() => {
              navigate("/send");
            }}
          >
            {tCommon("actions.send")}
          </HomeButton>
          <HomeButton
            icon={<img src="assets/icons/popicons/apps.svg" />}
            onClick={() => {
              window.open(`https://getalby.com/discover`, "_blank");
            }}
          >
            {tCommon("apps")}
          </HomeButton>
        </div>

        {isLoading && (
          <div className="flex justify-center">
            <Loading />
          </div>
        )}

        {!isLoading && (
          <div className="flex flex-col gap-4">
            {(transactions.length === 0 || needsKeySetup) && (
              <div className="flex flex-col gap-2 md:gap-3">
                {transactions.length === 0 && (
                  <IconLinkCard
                    title={t("default_view.actions.get_started.title")}
                    description={t(
                      "default_view.actions.get_started.description"
                    )}
                    icon={<PopiconsBulbLine className="w-8 h-8" />}
                    onClick={() => {
                      utils.openUrl(
                        "https://guides.getalby.com/user-guide/v/alby-account-and-browser-extension/"
                      );
                    }}
                  />
                )}
                {needsKeySetup && (
                  <IconLinkCard
                    title={t("default_view.actions.setup_keys.title")}
                    description={t(
                      "default_view.actions.setup_keys.description"
                    )}
                    icon={<PopiconsKeyLine className="w-8 h-8" />}
                    onClick={async () => {
                      openOptions(
                        `accounts/${currentAccount?.id}/secret-key/new`
                      );
                    }}
                  />
                )}
                {transactions.length === 0 && (
                  <IconLinkCard
                    title={t("default_view.actions.receive_bitcoin.title")}
                    description={t(
                      "default_view.actions.receive_bitcoin.description"
                    )}
                    icon={<PopiconsArrowDownLine className="w-8 h-8" />}
                    onClick={() => {
                      navigate("/receive");
                    }}
                  />
                )}
              </div>
            )}

            <TransactionsTable
              transactions={transactions}
              loading={isLoading}
            />

            {!isLoading && transactions.length > 0 && (
              <div className="text-center">
                <Hyperlink
                  onClick={() => handleViewAllLink("/transactions")}
                  className="flex justify-center items-center mt-2"
                >
                  {t("default_view.see_all")}
                  <PopiconsArrowRightLine className="ml-2 w-5 h-5" />
                </Hyperlink>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const HomeButton = ({
  icon,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    className="bg-white dark:bg-surface-01dp hover:bg-amber-50 dark:hover:bg-surface-02dp text-gray-800 dark:text-neutral-200 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-primary dark:hover:border-primary flex flex-col flex-1 justify-center items-center pt-[18px] pb-3 px-[14px] text-xs font-medium gap-2"
    onClick={onClick}
  >
    {icon}
    {children}
  </button>
);

export default DefaultView;
