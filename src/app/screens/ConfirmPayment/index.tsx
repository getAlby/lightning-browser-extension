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
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";

function ConfirmPayment() {
  const {
    isLoading: isLoadingSettings,
    settings,
    getFiatValue,
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

  useEffect(() => {
    (async () => {
      if (showFiat && invoice.satoshis) {
        const res = await getFiatValue(invoice.satoshis);
        setFiatAmount(res);
      }
    })();
  }, [invoice.satoshis, showFiat, getFiatValue]);

  useEffect(() => {
    (async () => {
      if (showFiat && budget) {
        const res = await getFiatValue(budget);
        setFiatBudgetAmount(res);
      }
    })();
  }, [budget, showFiat, getFiatValue]);

  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function confirm() {
    if (rememberMe && budget) {
      await saveBudget();
    }

    try {
      setLoading(true);
      const response = await utils.call(
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
          amount: `${invoice.satoshis} ${tCommon("sats", {
            count: invoice.satoshis as number,
          })}${showFiat ? ` (${fiatAmount})` : ``}`,
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

  function saveBudget() {
    if (!budget || !navState.origin) return;
    return msg.request("addAllowance", {
      totalBudget: parseInt(budget),
      host: navState.origin.host,
      name: navState.origin.name,
      imageURL: navState.origin.icon,
    });
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={!successMessage ? t("title") : tCommon("success")} />
      {!successMessage ? (
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
                  amount={invoice.satoshis}
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
              onConfirm={confirm}
              onCancel={reject}
              label={t("actions.pay_now")}
            />
            <p className="mb-4 text-center text-sm text-gray-400">
              <em>{tComponents("only_trusted")}</em>
            </p>
          </div>
        </Container>
      ) : (
        <Container justifyBetween maxWidth="sm">
          <ResultCard
            isSuccess
            message={
              !navState.origin
                ? successMessage
                : tCommon("success_message", {
                    amount: `${invoice.satoshis} ${tCommon("sats", {
                      count: invoice.satoshis as number,
                    })}`,
                    fiatAmount: showFiat ? ` (${fiatAmount})` : ``,
                    destination: navState.origin.name,
                  })
            }
          />
          <div className="my-4">
            <Button
              onClick={() => window.close()}
              label={tCommon("actions.close")}
              fullWidth
            />
          </div>
        </Container>
      )}
    </div>
  );
}

export default ConfirmPayment;
