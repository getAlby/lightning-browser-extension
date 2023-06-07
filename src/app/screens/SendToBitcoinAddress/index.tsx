import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import DualCurrencyField from "@components/form/DualCurrencyField";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Container from "~/app/components/Container";
import ResultCard from "~/app/components/ResultCard";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";

const Dt = ({ children }: { children: React.ReactNode }) => (
  <dt className="font-medium text-gray-800 dark:text-white">{children}</dt>
);

const Dd = ({ children }: { children: React.ReactNode }) => (
  <dd className="mb-4 text-gray-600 dark:text-neutral-500 break-all">
    {children}
  </dd>
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
  const [successMessage, setSuccessMessage] = useState("");
  const [fiatAmount, setFiatAmount] = useState("");

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

  async function confirm() {
    try {
      setLoading(true);

      // Do payment

      setStep("");
      setSuccessMessage("test");

      auth.fetchAccountInfo(); // Update balance.
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`Error: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function review() {
    try {
      setLoading(true);

      // Fetch swap info

      setStep("review");

      auth.fetchAccountInfo(); // Update balance.
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

  function handleReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    review();
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
          <form onSubmit={handleReview} className="h-full">
            <Container justifyBetween maxWidth="sm">
              <div>
                <Dt>{t("recipient.label")}</Dt>
                <Dd>{bitcoinAddress}</Dd>
                <DualCurrencyField
                  id="amount"
                  label={tCommon("amount")}
                  min={1}
                  onChange={(e) => setAmountSat(e.target.value)}
                  value={amountSat}
                  fiatValue={fiatAmount}
                  hint={`${tCommon("balance")}: ${
                    auth?.balancesDecorated?.accountBalance
                  }`}
                />
              </div>
              <ConfirmOrCancel
                label={tCommon("actions.review")}
                onCancel={reject}
                loading={loading}
                disabled={loading || !amountSat}
              />
            </Container>
          </form>
        )}
        {step == "review" && (
          <form onSubmit={handleConfirm} className="h-full">
            <Container justifyBetween maxWidth="sm">
              <div>
                <Dt>{t("recipient.label")}</Dt>
                <Dd>{bitcoinAddress}</Dd>
                <Dt>{tCommon("amount")}</Dt>
                <Dd>{amountSat}</Dd>
                <Dt>{t("network_fee.label")}</Dt>
                <Dd>3,060 sats (~0.83 USD)</Dd>
                <Dt>{t("swap_fee.label")}</Dt>
                <Dd>10,000 sats (~3.83 USD)</Dd>
                <hr className="my-3 dark:border-white/10" />
                <Dt>{t("total.label")}</Dt>
                <Dd>113,060 sats (~35.83 USD)</Dd>
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

        {!successMessage ? (
          <></>
        ) : (
          <Container justifyBetween maxWidth="sm">
            <ResultCard
              isSuccess
              message={tCommon("success_message", {
                amount: getFormattedSats(amountSat),
                fiatAmount: showFiat ? ` (${fiatAmount})` : ``,
                destination: bitcoinAddress,
              })}
            />
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
