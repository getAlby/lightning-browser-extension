import { CopyIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import BudgetControl from "@components/BudgetControl";
import Button from "@components/Button";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PaymentSummary from "@components/PaymentSummary";
import PublisherCard from "@components/PublisherCard";
import ResultCard from "@components/ResultCard";
import lightningPayReq from "bolt11";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
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
  const { t: tComponents } = useTranslation("components", {
    keyPrefix: "confirm_or_cancel",
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
  const [showQRCode, setShowQRCode] = useState(false);
  const [copyLabel, setCopyLabel] = useState(tCommon("actions.copy") as string);

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
      const response = await msg.request(
        "sendPayment",
        { paymentRequest: paymentRequest },
        {
          origin: navState.origin,
        }
      );
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
      setShowQRCode(true);
    }
  }

  function closeResult() {
    setShowQRCode(true);
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
        <form onSubmit={handleSubmit} className="h-full">
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
                    amount={invoice.satoshis || "0"} // how come that sathoshis can be undefined, bolt11?
                    fiatAmount={fiatAmount}
                    description={invoice.tagsObject.description}
                  />
                </div>
                {navState.origin && (
                  <BudgetControl
                    fiatAmount={fiatBudgetAmount}
                    remember={rememberMe}
                    onRememberChange={(event) => {
                      setRememberMe(event.target.checked);
                    }}
                    budget={budget}
                    onBudgetChange={(event) => setBudget(event.target.value)}
                  />
                )}
              </div>
            </div>
            <div>
              <ConfirmOrCancel
                disabled={loading}
                loading={loading}
                onCancel={reject}
                label={t("actions.pay_now")}
              />
              <p className="mb-4 text-center text-sm text-gray-400">
                <em>{tComponents("only_trusted")}</em>
              </p>
            </div>
          </Container>
        </form>
      ) : (
        <Container justifyBetween maxWidth="sm">
          {showQRCode ? (
            <div className="p-12 font-medium drop-shadow rounded-lg mt-4 flex flex-col items-center bg-white dark:bg-surface-02dp">
              <QRCode value={paymentRequest.toString()} level="M" />

              <div className="w-full mt-4 space-y-4">
                <div className="flex">
                  <input
                    type="text"
                    className="rounded-none rounded-l-lg bg-transparent border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.3 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={paymentRequest.toString()}
                    disabled
                  />
                  <span
                    onClick={async () => {
                      try {
                        navigator.clipboard.writeText(paymentRequest);
                        setCopyLabel(tCommon("copied"));
                        setTimeout(() => {
                          setCopyLabel(tCommon("actions.copy"));
                        }, 1000);
                      } catch (e) {
                        if (e instanceof Error) {
                          toast.error(e.message);
                        }
                      }
                    }}
                    className="inline-flex px-4 items-center border-r-0 border-gray-300 rounded-r-md font-medium shadow bg-orange-bitcoin hover:bg-orange-bitcoin-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-bitcoin transition duration-150"
                  >
                    <CopyIcon className="w-6 h-6 mr-2" />
                    {copyLabel}
                  </span>
                </div>
                <div className="flex items-center justify-center w-full">
                  <p className="text-orange-bitcoin-700">
                    {formattedInvoiceSats} was deposited
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
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
                close={closeResult}
              />
              <div className="my-4">
                <Button
                  onClick={close}
                  label={tCommon("actions.close")}
                  fullWidth
                />
              </div>
            </>
          )}
        </Container>
      )}
    </div>
  );
}

export default ConfirmPayment;
