import { ArrowRightIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import Loading from "@components/Loading";
import TransactionsTable from "@components/TransactionsTable";
import {
  PopiconsArrowDownLine,
  PopiconsBulbLine,
  PopiconsKeyLine,
} from "@popicons/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import BalanceBox from "~/app/components/BalanceBox";
import Hyperlink from "~/app/components/Hyperlink";
import { IconLinkCard } from "~/app/components/IconLinkCard/IconLinkCard";
import SkeletonLoader from "~/app/components/SkeletonLoader";
import toast from "~/app/components/Toast";
import { useAccount } from "~/app/context/AccountContext";
import { useTransactions } from "~/app/hooks/useTransactions";
import { PublisherLnData } from "~/app/screens/Home/PublisherLnData";
import api, { GetAccountRes } from "~/common/lib/api";
import msg from "~/common/lib/msg";
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

  const { account, accountLoading } = useAccount();

  const lightningAddress = account?.lightningAddress || "";

  const [isBlockedUrl, setIsBlockedUrl] = useState<boolean>(false);
  const [currentAccount, setCurrentAccount] = useState<GetAccountRes>();

  const { transactions, isLoadingTransactions, loadTransactions } =
    useTransactions();

  const isLoading = accountLoading || isLoadingTransactions;

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
        const account = await api.getAccount();
        setCurrentAccount(account);
      } catch (e) {
        console.error(e);
        if (e instanceof Error) toast.error(`Error: ${e.message}`);
      }
    })();
  }, []);

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
      <div className="p-4">
        <BalanceBox />
        {(accountLoading || lightningAddress) && (
          <div className="flex justify-center">
            <a
              className="cursor-pointer flex flex-row items-center mb-6 px-3 py-1 bg-white dark:bg-surface-01dp border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-white rounded-full text-xs font-medium hover:border-primary hover:bg-yellow-50 dark:hover:border-primary dark:hover:dark:bg-surface-16dp transition-all duration-250 select-none"
              onClick={() => {
                navigator.clipboard.writeText(lightningAddress);
                toast.success(tCommon("actions.copied_to_clipboard"));
              }}
            >
              <img src="assets/icons/popicons/bolt.svg" className="mr-1" />
              {!accountLoading ? (
                lightningAddress
              ) : (
                <SkeletonLoader className="w-32" />
              )}
            </a>
          </div>
        )}
        <div className="flex mb-4 space-x-3 justify-between">
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

        {isBlockedUrl && (
          <div className="mb-2 items-center py-3 dark:text-white">
            <p className="py-1">
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
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center">
            <Loading />
          </div>
        )}

        {!isLoading && (
          <div>
            <div className="flex flex-col gap-2 md:gap-3">
              {transactions.length == 0 && (
                <IconLinkCard
                  title={t("default_view.actions.get_started.title")}
                  description={t(
                    "default_view.actions.get_started.description"
                  )}
                  icon={
                    <PopiconsBulbLine className="w-8 h-8 text-gray-400 dark:text-neutral-500" />
                  }
                  onClick={() => {
                    utils.openUrl(
                      "https://guides.getalby.com/user-guide/v/alby-account-and-browser-extension/"
                    );
                  }}
                />
              )}

              {!(
                currentAccount?.hasMnemonic &&
                currentAccount?.isMnemonicBackupDone
              ) && (
                <IconLinkCard
                  title={t("default_view.actions.setup_keys.title")}
                  description={t("default_view.actions.setup_keys.description")}
                  icon={
                    <PopiconsKeyLine className="w-8 h-8 text-gray-400 dark:text-neutral-500" />
                  }
                  onClick={async () => {
                    openOptions(
                      `accounts/${currentAccount?.id}/secret-key/new`
                    );
                  }}
                />
              )}

              {transactions.length == 0 && (
                <IconLinkCard
                  title={t("default_view.actions.receive_bitcoin.title")}
                  description={t(
                    "default_view.actions.receive_bitcoin.description"
                  )}
                  icon={
                    <PopiconsArrowDownLine className="w-8 h-8 text-gray-400 dark:text-neutral-500" />
                  }
                  onClick={() => {
                    navigate("/receive");
                  }}
                />
              )}
            </div>
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
                  <ArrowRightIcon className="ml-2 w-4 h-4" />
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
