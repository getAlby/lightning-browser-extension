import BudgetControl from "@components/BudgetControl";
import Button from "@components/Button";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PaymentSummary from "@components/PaymentSummary";
import PublisherCard from "@components/PublisherCard";
import ResultCard from "@components/ResultCard";
import lightningPayReq from "bolt11-signet";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ScreenHeader from "~/app/components/ScreenHeader";
import toast from "~/app/components/Toast";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";

function ConfirmPayment() {
  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
    getFormattedSats,
  } = useSettings();

  const showFiat = !isLoadingSettings && settings.showFiat;

  const { t } = useTranslation("translation", {
    keyPrefix: "confirm_payment",
  });
  const { t: tCommon } = useTranslation("common");

  const navState = useNavigationState();
  const paymentRequest = navState.args?.paymentRequest as string;
  const invoice = lightningPayReq.decode(paymentRequest);

  const navigate = useNavigate();
  const auth = useAccount();

  const [budget, setBudget] = useState(
    ((invoice.satoshis || 0) * 10).toString()
  );
  const [fiatAmount, setFiatAmount] = useState("");
  const [fiatBudgetAmount, setFiatBudgetAmount] = useState("");

  const formattedInvoiceSats = getFormattedSats(invoice.satoshis || 0);

  useEffect(() => {
    (async () => {
      if (showFiat && invoice.satoshis) {
        const res = await getFormattedFiat(invoice.satoshis);
        setFiatAmount(res);
      }
    })();
  }, [invoice.satoshis, showFiat, getFormattedFiat]);

  useEffect(() => {
    (async () => {
      if (showFiat && budget) {
        const res = await getFormattedFiat(budget);
        setFiatBudgetAmount(res);
      }
    })();
  }, [budget, showFiat, getFormattedFiat]);

  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function confirm() {
    if (rememberMe && budget) {
      await saveBudget();
    }

    try {
      setLoading(true);
      const response = await api.sendPayment(paymentRequest, navState.origin);
      if ("error" in response) {
        throw new Error(response.error);
      }

      auth.fetchAccountInfo(); // Update balance.
      msg.reply(response);

      setSuccessMessage(
        t("success", {
          amount: `${formattedInvoiceSats} ${
            showFiat ? ` (${fiatAmount})` : ``
          }`,
        })
      );
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function reject(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (navState.isPrompt) {
      msg.error(USER_REJECTED_ERROR);
    } else {
      navigate(-1);
    }
  }

  function close(e: React.MouseEvent<HTMLButtonElement>) {
    if (navState.isPrompt) {
      window.close();
    } else {
      e.preventDefault();
      navigate(-1);
    }
  }

  function saveBudget() {
    if (!budget || !navState.origin) return;
    return msg.request("addAllowance", {
      totalBudget: parseInt(budget),
      host: navState.origin.host,
      name: navState.origin.name,
      imageURL: navState.origin.icon,
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    confirm();
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={!successMessage ? t("title") : tCommon("success")} />
      {!successMessage ? (
        <form onSubmit={handleSubmit} className="grow flex">
          <Container justifyBetween maxWidth="sm">
            <div>
              {navState.origin && (
                <PublisherCard
                  title={navState.origin.name}
                  image={navState.origin.icon}
                  url={navState.origin.host}
                />
              )}
              <div className="my-4">
                <div className="mb-4 p-4 shadow bg-white dark:bg-surface-02dp rounded-lg">
                  <PaymentSummary
                    amount={invoice.satoshis || "0"} // TODO: allow entering amount or do not allow zero-amount invoices
                    fiatAmount={fiatAmount}
                    description={invoice.tagsObject.description}
                  />
                </div>
              </div>
            </div>
            <div>
              {navState.origin && (
                <BudgetControl
                  fiatAmount={fiatBudgetAmount}
                  remember={rememberMe}
                  onRememberChange={(event) => {
                    setRememberMe(event.target.checked);
                  }}
                  budget={budget}
                  onBudgetChange={(event) => setBudget(event.target.value)}
                  disabled={loading}
                />
              )}
              <ConfirmOrCancel
                disabled={loading}
                loading={loading}
                onCancel={reject}
                label={t("actions.pay_now")}
              />
            </div>
          </Container>
        </form>
      ) : (
        <div className="grow">
          <Container justifyBetween maxWidth="sm">
            <ResultCard
              isSuccess
              message={
                !navState.origin
                  ? successMessage
                  : tCommon("success_message", {
                      amount: formattedInvoiceSats,
                      fiatAmount: showFiat ? ` (${fiatAmount})` : ``,
                      destination: navState.origin.name,
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
        </div>
      )}
    </div>
  );
}

export default ConfirmPayment;
