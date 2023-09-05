import {
  BitcoinCircleIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CopyIcon,
  LightningIcon,
} from "@bitcoin-design/bitcoin-icons-react/outline";
import Container from "@components/Container";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Avatar from "~/app/components/Avatar";
import QRCode from "~/app/components/QRCode";
import SkeletonLoader from "~/app/components/SkeletonLoader";
import { useAccount } from "~/app/context/AccountContext";
import RedeemIcon from "~/app/icons/RedeemIcon";
import { isAlbyLNDHubAccount, isAlbyOAuthAccount } from "~/app/utils";
import api from "~/common/lib/api";
import { delay } from "~/common/utils/helpers";

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

  async function getLightningAddress() {
    // Wait for a minimum delay to prevent flickering
    const [accountInfo] = await Promise.all([api.getAccountInfo(), delay(250)]);

    const lightningAddress = accountInfo.info.lightning_address;
    if (lightningAddress) setLightningAddress(lightningAddress);

    setLoadingLightningAddress(false);
  }

  useEffect(() => {
    getLightningAddress();
  }, []);

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <Header
        headerLeft={
          <IconButton
            onClick={() => {
              navigate(-1);
            }}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      >
        {t("title")}
      </Header>

      <div className="pt-4">
        <Container justifyBetween maxWidth="sm">
          <div className="flex flex-col gap-2">
            {isAlbyOAuthUser && (
              <div className="bg-white dark:bg-surface-01dp border-gray-200 dark:border-neutral-700 rounded border p-4 flex flex-col justify-center items-center gap-1 text-gray-800 dark:text-neutral-200">
                <>
                  <div className="relative flex flex-grid">
                    <div className="w-30 h-30">
                      {loadingLightningAddress ? (
                        <>
                          <SkeletonLoader className="w-30 h-30 relative -top-1 " />
                        </>
                      ) : (
                        <QRCode
                          value={`lightning:${lightningAddress}`}
                          size={128}
                        />
                      )}
                      {auth.account ? (
                        <Avatar
                          size={32}
                          className="border-[3px] border-white rounded-full absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                          url={auth.account.avatarUrl}
                          name={auth.account.id}
                        />
                      ) : (
                        <SkeletonLoader
                          circle
                          opaque={false}
                          className="w-[32px] h-[32px] border-[3px] border-white rounded-full absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 opacity-100"
                        />
                      )}
                    </div>
                  </div>
                  {loadingLightningAddress ? (
                    <SkeletonLoader className="w-32" />
                  ) : (
                    <a
                      className="flex flex-row items-center cursor-pointer font-medium text-sm leading-4"
                      onClick={() => {
                        navigator.clipboard.writeText(lightningAddress);
                        toast.success(tCommon("copied"));
                      }}
                    >
                      {lightningAddress}
                      <CopyIcon className="w-6 h-6" />
                    </a>
                  )}
                </>
              </div>
            )}
            <IconLinkCard
              title={"Lightning invoice"}
              description={"Request instant and specific amount payments"}
              icon={<LightningIcon className="w-8" />}
              onClick={() => {
                navigate("/receive/invoice");
              }}
            />
            {isAlbyUser && (
              <IconLinkCard
                title={"Bitcoin address"}
                description={"Receive via bitcoin address using a swap service"}
                icon={<BitcoinCircleIcon className="w-8" />}
                onClick={() => {
                  navigate("/onChainReceive");
                }}
              />
            )}
            <IconLinkCard
              title={"Redeem"}
              description={"Withdraw a bitcoin voucher via LNURL code"}
              icon={<RedeemIcon className="w-8" />}
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

type IconLinkCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
};

function IconLinkCard({
  icon,
  title,
  description,
  onClick,
}: IconLinkCardProps) {
  return (
    <div
      className="shadow rounded-md p-4 bg-white dark:bg-surface-01dp hover:bg-gray-50 dark:hover:bg-surface-02dp text-gray-800 dark:text-neutral-200 cursor-pointer flex flex-row items-center gap-3"
      onClick={onClick}
    >
      <div className="flex-shrink-0 flex justify-center">{icon}</div>
      <div className="flex-grow">
        <div className="font-medium leading-5 text-sm">{title}</div>
        <div className="text-gray-600 dark:text-neutral-400 text-xs leading-4">
          {description}
        </div>
      </div>
      <div className="flex-shrink-0 flex justify-end ">
        <CaretRightIcon className="w-10" />
      </div>
    </div>
  );
}
