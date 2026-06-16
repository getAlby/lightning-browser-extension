import Header from "@components/Header";
import IconButton from "@components/IconButton";
import { PopiconsChevronLeftLine } from "@popicons/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Container from "~/app/components/Container";
import { useNavigationState } from "~/app/hooks/useNavigationState";

function SendToBitcoinAddress() {
  const navigate = useNavigate();
  const navState = useNavigationState();
  const bitcoinAddress = navState.args?.bitcoinAddress as string | undefined;
  const { t } = useTranslation("translation", {
    keyPrefix: "send_to_bitcoin_address",
  });

  const boltzUrl = bitcoinAddress
    ? `https://boltz.exchange/?sendAsset=LN&receiveAsset=BTC&destination=${encodeURIComponent(
        bitcoinAddress
      )}`
    : "https://boltz.exchange/";

  const sideshiftUrl = bitcoinAddress
    ? `https://sideshift.ai/ln/btc?settleAddress=${encodeURIComponent(
        bitcoinAddress
      )}`
    : "https://sideshift.ai/ln/btc";

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <Header
        headerLeft={
          <IconButton
            onClick={() => navigate("/send")}
            icon={<PopiconsChevronLeftLine className="w-5 h-5" />}
          />
        }
      >
        {t("title")}
      </Header>
      <div>
        <Container maxWidth="sm">
          <div className="flex flex-col">
            <ExchangeLink
              href={boltzUrl}
              imageSrc="/assets/icons/swap/boltz.png"
              title="Boltz Exchange"
              description="Privacy first, non-Custodial bitcoin exchange"
            />
            <ExchangeLink
              href={sideshiftUrl}
              imageSrc="/assets/icons/swap/sideshift.svg"
              title="sideshift.ai"
              description="No sign-up crypto exchange"
            />
          </div>
        </Container>
      </div>
    </div>
  );
}

export default SendToBitcoinAddress;

interface ExchangeLinkProps {
  href: string;
  imageSrc: string;
  title: string;
  description: string;
}

const ExchangeLink: React.FC<ExchangeLinkProps> = ({
  href,
  imageSrc,
  title,
  description,
}) => {
  return (
    <a key={href} href={href} target="_blank" rel="noreferrer" className="mt-4">
      <div className="bg-white dark:bg-surface-01dp shadow flex p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer w-full">
        <div className="flex space-x-3 items-center ">
          <img
            src={imageSrc}
            alt="image"
            className="h-14 w-14 rounded-lg object-cover"
          />
          <div>
            <h2 className="font-medium font-serif text-base dark:text-white">
              {title}
            </h2>
            <p className="font-serif text-sm font-normal text-gray-500 dark:text-neutral-400 line-clamp-3">
              {description}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
};
