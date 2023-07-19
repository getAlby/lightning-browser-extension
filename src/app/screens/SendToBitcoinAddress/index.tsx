import {
  CaretLeftIcon,
  ExportIcon,
  InfoIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import DualCurrencyField from "@components/form/DualCurrencyField";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Alert from "~/app/components/Alert";
import Container from "~/app/components/Container";
import Hyperlink from "~/app/components/Hyperlink";
import ResultCard from "~/app/components/ResultCard";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";

const SWAP_API = "http://localhost:3000/api/swaps";

const Dt = ({ children }: { children: React.ReactNode }) => (
  <dt className="text-sm text-gray-500 dark:text-neutral-500">{children}</dt>
);

const Dd = ({ children }: { children: React.ReactNode }) => (
  <dd className="text-gray-700 dark:text-neutral-200">{children}</dd>
);

type ReviewData = {
  address: string;
  service_fee: number;
  network_fee: number;
  amount: number;
  total: number;
  invoice: string;
};

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

  const [serviceFeePercentage, setServiceFeePercentage] = useState(0);
  const [feesLoading, setFeesLoading] = useState(false);
  const [networkFee, setNetworkFee] = useState(0);
  const [networkFeeFiat, setNetworkFeeFiat] = useState("");
  const [serviceFeeFiat, setServiceFeeFiat] = useState("");
  const [satsPerVbyte, setSatsPerVbyte] = useState(0);
  const [totalAmountFiat, setTotalAmountFiat] = useState("");
  const [amountFiat, setAmountFiat] = useState("");

  const [swapDataLoading, setSwapDataLoading] = useState(false);
  const [swapData, setSwapData] = useState<ReviewData | undefined>();

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
        const result = await axios.get<{
          service_fee_percentage: number;
          network_fee: number;
          sats_per_vbyte: number;
        }>(`${SWAP_API}/info`, { adapter: fetchAdapter });

        setServiceFeePercentage(result.data.service_fee_percentage);
        setNetworkFee(result.data.network_fee);
        setSatsPerVbyte(result.data.sats_per_vbyte);

        if (showFiat) {
          const test = await getFormattedFiat(result.data.network_fee);
          setNetworkFeeFiat(test);
        }
      } catch (e) {
        console.error(e);
        if (e instanceof Error) toast.error(e.message);
      } finally {
        setFeesLoading(false);
      }
    })();
  }, [getFormattedFiat, showFiat]);

  async function confirm() {
    try {
      setLoading(true);

      // TODO: Excute payment
      await new Promise((r) => setTimeout(r, 2000));

      // TODO: move to api
      // const response = await msg.request(
      //   "sendPayment",
      //   { paymentRequest: swapData?.invoice },
      //   {
      //     origin: navState.origin,
      //   }
      // );

      // if (response.error) {
      //   throw new Error(response.error as string);
      // }

      auth.fetchAccountInfo(); // Update balance.
      // msg.reply(response);

      setStep("");
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

      const result = await axios.post<ReviewData>(
        SWAP_API,
        {
          amount: amountSat,
          address: bitcoinAddress,
          sats_per_vbyte: satsPerVbyte,
        },
        {
          adapter: fetchAdapter,
        }
      );
      setSwapData(result.data);

      setAmountFiat(await getFormattedFiat(result.data.amount));
      setNetworkFeeFiat(await getFormattedFiat(result.data.network_fee));
      setServiceFeeFiat(await getFormattedFiat(result.data.service_fee));
      setTotalAmountFiat(await getFormattedFiat(result.data.total));

      setStep("success");
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

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <Header
        title={t("title")}
        headerLeft={
          <IconButton
            onClick={() => navigate("/send")}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      />
      <div className="h-full py-5">
        {step == "amount" && (
          <form onSubmit={handleReview} className="h-full flex space-between">
            <Container justifyBetween maxWidth="sm">
              <div className="flex flex-col gap-4 mb-4">
                <div>
                  <Dt>{t("recipient.label")}</Dt>
                  <Dd>{bitcoinAddress}</Dd>
                </div>
                <DualCurrencyField
                  id="amount"
                  label={tCommon("amount")}
                  min={10000}
                  max={1000000}
                  onChange={(e) => setAmountSat(e.target.value)}
                  value={amountSat}
                  fiatValue={fiatAmount}
                  hint={`${tCommon("balance")}: ${
                    auth?.balancesDecorated?.accountBalance
                  }`}
                />
                {/* TODO: Fix icon, noopener nofollow */}
                <Alert type="info">
                  <InfoIcon className="w-6 h-6 float-left rounded-full border border-1 border-blue-700  dark:border-blue-300 mr-2 " />
                  <Trans
                    i18nKey={"swaps_provided_by"}
                    t={t}
                    components={[
                      // eslint-disable-next-line react/jsx-key
                      <Hyperlink
                        className="underline hover:text-blue-800 dark:hover:text-blue-200"
                        href="https://deezy.io"
                        target="_blank"
                      >
                        content
                      </Hyperlink>,
                    ]}
                  />
                </Alert>
                <div>
                  <Dt>{t("service_fee.label")}</Dt>
                  <Dd>
                    {feesLoading ? (
                      <Skeleton className="w-8" />
                    ) : (
                      `${serviceFeePercentage} %`
                    )}
                  </Dd>
                </div>
                <div>
                  <Dt>{t("network_fee.label")}</Dt>
                  <Dd>
                    {feesLoading ? (
                      <Skeleton className="w-12" />
                    ) : (
                      <div className="flex justify-between">
                        <span>~{getFormattedSats(networkFee)}</span>
                        <span className="text-sm text-gray-500 dark:text-neutral-500">
                          {networkFeeFiat}
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
                disabled={loading || feesLoading || !amountSat}
              />
            </Container>
          </form>
        )}
        {step == "review" && swapData && (
          <form onSubmit={handleConfirm} className="h-full">
            <Container justifyBetween maxWidth="sm">
              <div className="flex flex-col gap-4 mb-4">
                <div>
                  <Dt>{t("recipient.label")}</Dt>
                  <Dd>{swapData.address}</Dd>
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
                <hr className="my-3 dark:border-white/10" />
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
                <Alert type="info">
                  <InfoIcon className="w-6 h-6 float-left rounded-full border border-1 border-blue-700  dark:border-blue-300 mr-2 " />
                  {t("time_estimate")}
                </Alert>
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
                destination: bitcoinAddress,
              })}
            />
            {/* TODO: rel="noopener nofollow" */}
            <div className="text-center my-4">
              <Hyperlink
                href={`https://mempool.space/address/${bitcoinAddress}`}
              >
                {t("view_on_explorer")}
                <ExportIcon className="w-6 h-6 inline" />
              </Hyperlink>
            </div>
            <div className="my-4">
              <Button
                onClick={close}
                label={tCommon("actions.close")}
                fullWidth
              />
            </div>
          </Container>
        )}
      </div>
    </div>
  );
}

export default SendToBitcoinAddress;