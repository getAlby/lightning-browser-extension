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
import { isAlbyOAuthAccount } from "~/app/utils";
import api from "~/common/lib/api";
import { IconLinkCard } from "../../components/IconLinkCard/IconLinkCard";

function Receive() {
  const auth = useAccount();
  const navigate = useNavigate();
  const { t } = useTranslation("translation", { keyPrefix: "receive" });
  const { t: tCommon } = useTranslation("common");

  const [loadingLightningAddress, setLoadingLightningAddress] = useState(true);

  const [lightningAddress, setLightningAddress] = useState("");
  const isAlbyOAuthUser = isAlbyOAuthAccount(auth.account?.connectorType);

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
              icon={<PopiconsBoltLine className="w-8 h-8" />}
              onClick={() => {
                navigate("/receive/invoice");
              }}
            />
            <IconLinkCard
              title={t("actions.redeem.title")}
              description={t("actions.redeem.description")}
              icon={<PopiconsWithdrawalLine className="w-8 h-8" />}
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
