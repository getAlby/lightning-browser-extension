import Button from "@components/Button";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import ContentMessage from "@components/ContentMessage";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import ResultCard from "@components/ResultCard";
import SatButtons from "@components/SatButtons";
import DualCurrencyField from "@components/form/DualCurrencyField";
import { PopiconsChevronLeftLine } from "@popicons/react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Container from "~/app/components/Container";
import toast from "~/app/components/Toast";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import msg from "~/common/lib/msg";

function Keysend() {
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
  const [amountSat, setAmountSat] = useState(navState?.args?.amount || "1");
  const customRecords = navState?.args?.customRecords;
  const destination = navState?.args?.destination as string;
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [fiatAmount, setFiatAmount] = useState("");

  const { t } = useTranslation("translation", { keyPrefix: "keysend" });
  const { t: tCommon } = useTranslation("common");

  const amountMin = 1;

  const amountExceeded =
    (auth?.account?.currency || "BTC") !== "BTC"
      ? false
      : +amountSat > (auth?.account?.balance || 0);
  const rangeExceeded = +amountSat < amountMin;

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
      const payment = await msg.request(
        "keysend",
        { destination, amount: amountSat, customRecords },
        {
          origin: {
            name: destination,
          },
        }
      );

      setSuccessMessage(
        t("success", {
          preimage: payment.preimage,
        })
      );

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    confirm();
  }

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
      {!successMessage ? (
        <>
          <form onSubmit={handleSubmit} className="h-full">
            <Container justifyBetween maxWidth="sm">
              <div>
                <ContentMessage
                  heading={t("receiver.label")}
                  content={destination}
                />
                <DualCurrencyField
                  id="amount"
                  label={t("amount.label")}
                  min={1}
                  onChange={(e) => setAmountSat(e.target.value)}
                  value={amountSat}
                  fiatValue={fiatAmount}
                  hint={`${tCommon("balance")}: ${auth?.balancesDecorated
                    ?.accountBalance}`}
                  amountExceeded={amountExceeded}
                  rangeExceeded={rangeExceeded}
                />
                <SatButtons onClick={setAmountSat} />
              </div>
              <div className="mt-8">
                <ConfirmOrCancel
                  label={tCommon("actions.confirm")}
                  onCancel={reject}
                  loading={loading}
                  disabled={loading || rangeExceeded || amountExceeded}
                />
              </div>
            </Container>
          </form>
        </>
      ) : (
        <Container justifyBetween maxWidth="sm">
          <ResultCard
            isSuccess
            message={
              !destination
                ? successMessage
                : tCommon("success_message", {
                    amount: getFormattedSats(amountSat),
                    fiatAmount: showFiat ? ` (${fiatAmount})` : ``,
                    destination,
                  })
            }
          />
          <div className="mt-4">
            <Button
              onClick={close}
              label={tCommon("actions.close")}
              fullWidth
            />
          </div>
        </Container>
      )}
    </div>
  );
}

export default Keysend;
