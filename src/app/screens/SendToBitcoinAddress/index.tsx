import { PopiconsLinkExternalSolid } from "@popicons/react";
import Button from "@components/Button";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import DualCurrencyField from "@components/form/DualCurrencyField";
import { CreateSwapResponse } from "@getalby/sdk/dist/types";
import { PopiconsChevronLeftLine } from "@popicons/react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import Alert from "~/app/components/Alert";
import Container from "~/app/components/Container";
import Hyperlink from "~/app/components/Hyperlink";
import ResultCard from "~/app/components/ResultCard";
import toast from "~/app/components/Toast";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";

const Dt = ({ children }: { children: React.ReactNode }) => (
  <dt className="text-sm text-gray-500 dark:text-neutral-500">{children}</dt>
);

const Dd = ({ children }: { children: React.ReactNode }) => (
  <dd className="text-gray-700 dark:text-neutral-200">{children}</dd>
);

function SendToBitcoinAddress() {
  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
    getFormattedSats,
  } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;
  const navState = useNavigationState();
  const navigate = useNavigate();
  const auth = useAccount();
  const bitcoinAddress = navState.args?.bitcoinAddress as string;
  const [amountSat, setAmountSat] = useState("");
  const [step, setStep] = useState("amount");
  const [loading, setLoading] = useState(false);
  const [fiatAmount, setFiatAmount] = useState("");
  const [predictedTotalFee, setPredictedTotalFee] = useState("0");
  const [predictedTotalFeeFiat, setPredictedTotalFeeFiat] = useState("0");

  const [serviceFeePercentage, setServiceFeePercentage] = useState(0);
  const [feesLoading, setFeesLoading] = useState(false);
  const [networkFee, setNetworkFee] = useState(0);
  const [networkFeeFiat, setNetworkFeeFiat] = useState("");
  const [serviceFeeFiat, setServiceFeeFiat] = useState("");
  const [satsPerVbyte, setSatsPerVbyte] = useState(0);
  const [totalAmountFiat, setTotalAmountFiat] = useState("");
  const [amountFiat, setAmountFiat] = useState("");

  const [swapDataLoading, setSwapDataLoading] = useState(false);
  const [swapData, setSwapData] = useState<CreateSwapResponse | undefined>();

  const { t } = useTranslation("translation", {
    keyPrefix: "send_to_bitcoin_address",
  });
  const { t: tCommon } = useTranslation("common");

  useEffect(() => {
    (async () => {
      if (amountSat !== "" && showFiat) {
        const res = await getFormattedFiat(amountSat);
        setFiatAmount(res);
      }
    })();
  }, [amountSat, showFiat, getFormattedFiat]);

  useEffect(() => {
    (async () => {
      try {
        setFeesLoading(true);

        const result = await api.getSwapInfo();
        if (!result.available) {
          throw new Error("Swaps currently not available");
        }

        setServiceFeePercentage(result.service_fee_percentage);
        setSatsPerVbyte(result.sats_per_vbyte);
        setNetworkFee(result.network_fee);
        if (showFiat) {
          setNetworkFeeFiat(await getFormattedFiat(result.network_fee));
        }
      } catch (e) {
        console.error(e);
        setStep("unavailable");
      } finally {
        setFeesLoading(false);
      }
    })();
  }, [getFormattedFiat, showFiat, t]);

  useEffect(() => {
    if (!feesLoading) {
      try {
        const predictedTotalFee = Math.floor(
          parseInt(amountSat || "0") * (serviceFeePercentage / 100) + networkFee
        );
        setPredictedTotalFee(getFormattedSats(predictedTotalFee));
        (async () => {
          setPredictedTotalFeeFiat(await getFormattedFiat(predictedTotalFee));
        })();
      } catch (error) {
        setPredictedTotalFee("0");
        setPredictedTotalFeeFiat("0");
      }
    }
  }, [
    getFormattedFiat,
    amountSat,
    feesLoading,
    getFormattedSats,
    serviceFeePercentage,
    networkFee,
  ]);

  async function confirm() {
    if (!swapData) return;

    try {
      setLoading(true);

      const response = await msg.request(
        "sendPayment",
        {
          paymentRequest: swapData.payment_request,
        },
        {
          origin: navState.origin,
        }
      );

      if (response.error) {
        throw new Error(response.error as string);
      }

      // Update balance
      auth.fetchAccountInfo();

      setStep("success");
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`Error: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  function reject(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    navigate(-1);
  }

  function close(e: React.MouseEvent<HTMLButtonElement>) {
    // will never be reached via prompt
    e.preventDefault();
    navigate(-1);
  }

  async function handleReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSwapDataLoading(true);

      const result = await api.createSwap({
        amount: +amountSat,
        address: bitcoinAddress,
        sats_per_vbyte: satsPerVbyte,
      });

      setSwapData(result);
      if (showFiat) {
        setAmountFiat(await getFormattedFiat(result.amount));
        setNetworkFeeFiat(await getFormattedFiat(result.network_fee));
        setServiceFeeFiat(await getFormattedFiat(result.service_fee));
        setTotalAmountFiat(await getFormattedFiat(result.total));
      }
      setStep("review");
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`Error: ${e.message}`);
      }
    } finally {
      setSwapDataLoading(false);
    }
  }

  function handleConfirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    confirm();
  }

  const amountMin = 100_000;
  const amountMax = 10_000_000;

  const amountExceeded =
    (auth?.account?.currency || "BTC") !== "BTC"
      ? false
      : +amountSat > (auth?.account?.balance || 0);
  const rangeExceeded = +amountSat > amountMax || +amountSat < amountMin;

  const timeEstimateAlert = <Alert type="info">{t("time_estimate")}</Alert>;

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
      <div className="h-full pt-5">
        {step == "amount" && (
          <form onSubmit={handleReview} className="h-full flex space-between">
            <Container justifyBetween maxWidth="sm">
              <div className="flex flex-col gap-3 mb-4">
                <div>
                  <Dt>{t("recipient.label")}</Dt>
                  <Dd>
                    <BitcoinAddress address={bitcoinAddress} />
                  </Dd>
                </div>
                <div>
                  <Dt>{t("provider.label")}</Dt>
                  <Dd>
                    <Hyperlink
                      href="https://deezy.io"
                      target="_blank"
                      rel="noopener nofollow"
                    >
                      deezy.io
                    </Hyperlink>
                    &nbsp; (support@deezy.io)
                  </Dd>
                </div>
                <DualCurrencyField
                  id="amount"
                  label={tCommon("amount")}
                  min={amountMin}
                  max={amountMax}
                  onChange={(e) => setAmountSat(e.target.value)}
                  value={amountSat}
                  fiatValue={fiatAmount}
                  rangeExceeded={rangeExceeded}
                  amountExceeded={amountExceeded}
                  hint={`${tCommon("balance")}: ${auth?.balancesDecorated
                    ?.accountBalance}`}
                />
                <div>
                  <Dt>{t("total_fee.label")}</Dt>
                  <Dd>
                    {feesLoading ? (
                      <Skeleton className="w-8" />
                    ) : (
                      <div className="flex justify-between">
                        <span>~{predictedTotalFee}</span>
                        <span className="text-sm text-gray-500 dark:text-neutral-500">
                          {predictedTotalFeeFiat}
                        </span>
                      </div>
                    )}
                  </Dd>
                </div>
              </div>
              <ConfirmOrCancel
                label={tCommon("actions.review")}
                onCancel={reject}
                loading={loading || swapDataLoading}
                disabled={
                  loading ||
                  feesLoading ||
                  swapDataLoading ||
                  !networkFee || // Loading swap info failed
                  !amountSat ||
                  rangeExceeded ||
                  amountExceeded
                }
              />
            </Container>
          </form>
        )}
        {step == "review" && swapData && (
          <form onSubmit={handleConfirm} className="h-full">
            <Container justifyBetween maxWidth="sm">
              <div className="flex flex-col gap-3 mb-4">
                <div>
                  <Dt>{t("recipient.label")}</Dt>
                  <Dd>
                    <BitcoinAddress address={swapData.address} />
                  </Dd>
                </div>
                <div>
                  <Dt>{tCommon("amount")}</Dt>
                  <Dd>
                    <div className="flex justify-between">
                      <span>{getFormattedSats(swapData.amount)}</span>
                      <span className="text-sm text-gray-500 dark:text-neutral-500">
                        {amountFiat}
                      </span>
                    </div>
                  </Dd>
                </div>
                <div>
                  <Dt>{t("network_fee.label")}</Dt>
                  <Dd>
                    <div className="flex justify-between">
                      <span>{getFormattedSats(swapData.network_fee)}</span>
                      <span className="text-sm text-gray-500 dark:text-neutral-500">
                        {networkFeeFiat}
                      </span>
                    </div>
                  </Dd>
                </div>
                <div>
                  <Dt>{t("service_fee.label")}</Dt>
                  <Dd>
                    <div className="flex justify-between">
                      <span>{getFormattedSats(swapData.service_fee)}</span>
                      <span className="text-sm text-gray-500 dark:text-neutral-500">
                        {serviceFeeFiat}
                      </span>
                    </div>
                  </Dd>
                </div>
                <hr className="dark:border-white/10" />
                <div className="text-lg">
                  <Dt>{t("total.label")}</Dt>
                  <Dd>
                    <div className="flex justify-between">
                      <span>{getFormattedSats(swapData.total)}</span>
                      <span className="text-gray-500 dark:text-neutral-500">
                        {totalAmountFiat}
                      </span>
                    </div>
                  </Dd>
                </div>
                <div className="">{timeEstimateAlert}</div>
              </div>
              <ConfirmOrCancel
                label={tCommon("actions.confirm")}
                onCancel={reject}
                loading={loading}
                disabled={loading || !amountSat}
              />
            </Container>
          </form>
        )}
        {step == "success" && (
          <Container justifyBetween maxWidth="sm">
            <ResultCard
              isSuccess
              message={tCommon("success_message", {
                amount: getFormattedSats(amountSat),
                fiatAmount: showFiat ? ` (${fiatAmount})` : ``,
                destination:
                  bitcoinAddress.substring(0, 7) +
                  "..." +
                  bitcoinAddress.substring(bitcoinAddress.length - 7),
              })}
            />
            <div className="text-center my-4">
              <Hyperlink
                href={`https://mempool.space/address/${bitcoinAddress}`}
                rel="noopener nofollow"
                target="_blank"
              >
                {t("view_on_explorer")}
                <PopiconsLinkExternalSolid className="w-6 h-6 inline" />
              </Hyperlink>
            </div>
            {timeEstimateAlert}
            <div className="mt-4">
              <Button
                onClick={close}
                label={tCommon("actions.close")}
                fullWidth
              />
            </div>
          </Container>
        )}
        {step == "unavailable" && (
          <Container justifyBetween maxWidth="sm">
            <Alert type="info">
              Built-in swaps are currently unavailable. You can use one of the
              following swap providers in the meantime:
            </Alert>
            <ExchangeLink
              href="https://boltz.exchange/"
              imageSrc="/assets/icons/swap/boltz.png"
              title="Boltz Exchange"
              description="Privacy first, non-Custodial bitcoin exchange"
            />
            <ExchangeLink
              href="https://swap.deezy.io/"
              imageSrc="/assets/icons/swap/deezy.svg"
              title="Deezy"
              description="Swap instantly between lightning and on-chain bitcoin"
            />
            <ExchangeLink
              href="https://sideshift.ai/ln/btc"
              imageSrc="/assets/icons/swap/sideshift.svg"
              title="sideshift.ai"
              description="No sign-up crypto exchange"
            />
          </Container>
        )}
      </div>
    </div>
  );
}

export default SendToBitcoinAddress;

// Define the types for the component props
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

type BitcoinAddressProps = {
  address: string;
};

function BitcoinAddress({ address }: BitcoinAddressProps) {
  return (
    <span title={address}>
      {address.substring(0, 18) +
        "..." +
        address.substring(address.length - 18)}
    </span>
  );
}
