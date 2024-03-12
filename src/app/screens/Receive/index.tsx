import Container from "@components/Container";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import {
  PopiconsBoltLine,
  PopiconsChevronLeftLine,
  PopiconsCopyLine,
  PopiconsWithdrawalLine,
} from "@popicons/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Avatar from "~/app/components/Avatar";
import QRCode from "~/app/components/QRCode";
import SkeletonLoader from "~/app/components/SkeletonLoader";
import toast from "~/app/components/Toast";
import { useAccount } from "~/app/context/AccountContext";
import { isAlbyLNDHubAccount, isAlbyOAuthAccount } from "~/app/utils";
import api from "~/common/lib/api";
import { IconLinkCard } from "../../components/IconLinkCard/IconLinkCard";

function Receive() {
  const auth = useAccount();
  const navigate = useNavigate();
  const { t } = useTranslation("translation", { keyPrefix: "receive" });
  const { t: tCommon } = useTranslation("common");

  const [loadingLightningAddress, setLoadingLightningAddress] = useState(true);

  const [lightningAddress, setLightningAddress] = useState("");
  const isAlbyLNDHubUser = isAlbyLNDHubAccount(
    auth.account?.alias,
    auth.account?.connectorType
  );
  const isAlbyOAuthUser = isAlbyOAuthAccount(auth.account?.connectorType);
  const isAlbyUser = isAlbyOAuthUser || isAlbyLNDHubUser;

  useEffect(() => {
    (async () => {
      if (!auth.account) return;
      const accountInfo = await api.swr.getAccountInfo(auth.account.id);

      const lightningAddress = accountInfo.lightningAddress;
      if (lightningAddress) setLightningAddress(lightningAddress);

      setLoadingLightningAddress(false);
    })();
  }, [auth.account]);

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <Header
        headerLeft={
          <IconButton
            onClick={() => {
              navigate(-1);
            }}
            icon={<PopiconsChevronLeftLine className="w-5 h-5" />}
          />
        }
      >
        {t("title")}
      </Header>

      <div className="pt-4">
        <Container justifyBetween maxWidth="sm">
          <div className="flex flex-col gap-2 md:gap-3">
            {isAlbyOAuthUser && (
              <div className="bg-white dark:bg-surface-01dp border-gray-200 dark:border-neutral-700 rounded border p-4 flex flex-col justify-center items-center gap-1 text-gray-800 dark:text-neutral-200">
                <>
                  <div className="relative flex flex-grid">
                    <div className="w-32 h-32 md:w-48 md:h-48">
                      {loadingLightningAddress ? (
                        <SkeletonLoader className="w-32 h-32 relative -top-1" />
                      ) : (
                        <>
                          <QRCode
                            className="rounded-md"
                            value={lightningAddress}
                            size={192}
                            level="Q"
                          />
                        </>
                      )}
                      {!auth.accountLoading && auth.account ? (
                        <Avatar
                          size={40}
                          className="border-4 border-white rounded-full absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white"
                          url={auth.account.avatarUrl}
                          name={auth.account.id}
                        />
                      ) : (
                        auth.accountLoading && (
                          <SkeletonLoader
                            circle
                            opaque={false}
                            className="w-[40px] h-[40px] border-4 border-white rounded-full absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 opacity-100"
                          />
                        )
                      )}
                    </div>
                  </div>
                  <div className="mt-1 text-xs md:text-sm leading-4 font-medium">
                    {loadingLightningAddress ? (
                      <SkeletonLoader className="w-40 relative" />
                    ) : (
                      <a
                        className="flex flex-row items-center cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(lightningAddress);
                          toast.success(tCommon("copied"));
                        }}
                      >
                        {lightningAddress}
                        <PopiconsCopyLine className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </>
              </div>
            )}
            <IconLinkCard
              title={t("actions.invoice.title")}
              description={t("actions.invoice.description")}
              icon={
                <PopiconsBoltLine className="w-8 h-8 text-gray-400 dark:text-neutral-500" />
              }
              onClick={() => {
                navigate("/receive/invoice");
              }}
            />
            {isAlbyUser && (
              <IconLinkCard
                title={t("actions.bitcoin_address.title")}
                description={t("actions.bitcoin_address.description")}
                icon={
                  <svg
                    className="w-10 h-10 text-gray-400 dark:text-neutral-500"
                    data-v-52a72b4a=""
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M20.247 14.052a8.502 8.502 0 01-10.302 6.194C5.394 19.11 2.62 14.5 3.754 9.95c1.134-4.551 5.74-7.33 10.288-6.195 4.562 1.12 7.337 5.744 6.205 10.298z"></path>
                    <path
                      strokeLinecap="square"
                      strokeLinejoin="round"
                      d="M9.4 14.912l1.693-6.792M9.637 7.757L13.818 8.8c2.728.68 2.12 3.877-.786 3.153 3.184.794 2.86 4.578-.907 3.639-1.841-.46-3.813-.95-3.813-.95M10.306 11.274l2.669.665M11.578 8.241l.363-1.455M9.521 16.489l.363-1.456M13.518 8.725l.363-1.455M11.462 16.973l.363-1.456"
                    ></path>
                  </svg>
                }
                onClick={() => {
                  navigate("/onChainReceive");
                }}
              />
            )}
            <IconLinkCard
              title={t("actions.redeem.title")}
              description={t("actions.redeem.description")}
              icon={
                <PopiconsWithdrawalLine className="w-8 h-8 text-gray-400 dark:text-neutral-500" />
              }
              onClick={() => {
                navigate("/lnurlRedeem");
              }}
            />
          </div>
        </Container>
      </div>
    </div>
  );
}

export default Receive;
