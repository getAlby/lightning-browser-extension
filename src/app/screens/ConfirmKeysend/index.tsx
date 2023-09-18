import BudgetControl from "@components/BudgetControl";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PaymentSummary from "@components/PaymentSummary";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ScreenHeader from "~/app/components/ScreenHeader";
import toast from "~/app/components/Toast";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import type { OriginData } from "~/types";

function ConfirmKeysend() {
  const navState = useNavigationState();
  const destination = navState.args?.destination as string;
  const amount = navState.args?.amount as string;
  const customRecords = navState.args?.customRecords as Record<string, string>;
  const origin = navState.origin as OriginData;

  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "confirm_keysend",
  });

  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
  } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;

  const navigate = useNavigate();

  const [rememberMe, setRememberMe] = useState(false);
  const [budget, setBudget] = useState(
    ((parseInt(amount) || 0) * 10).toString()
  );
  const [fiatAmount, setFiatAmount] = useState("");
  const [fiatBudgetAmount, setFiatBudgetAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    (async () => {
      if (showFiat && amount) {
        const res = await getFormattedFiat(amount);
        setFiatAmount(res);
      }
    })();
  }, [amount, showFiat, getFormattedFiat]);

  useEffect(() => {
    (async () => {
      const res = await getFormattedFiat(budget);
      setFiatBudgetAmount(res);
    })();
  }, [budget, showFiat, getFormattedFiat]);

  async function confirm() {
    if (rememberMe && budget) {
      await saveBudget();
    }
    try {
      setLoading(true);
      const payment = await msg.request(
        "keysend",
        { destination, amount, customRecords },
        {
          origin: {
            ...origin,
            name: destination,
          },
        }
      );

      msg.reply(payment); // resolves the prompt promise and closes the prompt window
      setSuccessMessage(
        t("success", {
          preimage: payment.preimage,
        })
      );
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`${tCommon("error")}: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  function reject(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (origin) {
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
    if (!budget) return;
    return msg.request("addAllowance", {
      totalBudget: parseInt(budget),
      host: origin.host,
      name: origin.name,
      imageURL: origin.icon,
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    confirm();
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      {!successMessage ? (
        <form onSubmit={handleSubmit} className="h-full">
          <Container justifyBetween maxWidth="sm">
            <div>
              <PublisherCard
                title={origin.name}
                image={origin.icon}
                url={origin.host}
              />
              <div className="my-4">
                <div className="shadow mb-4 bg-white dark:bg-surface-02dp p-4 rounded-lg">
                  <PaymentSummary
                    amount={amount}
                    fiatAmount={fiatAmount}
                    description={t("payment_summary.description", {
                      destination,
                    })}
                  />
                </div>
              </div>
            </div>
            <div>
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
              <ConfirmOrCancel
                disabled={loading}
                loading={loading}
                onCancel={reject}
              />
            </div>
          </Container>
        </form>
      ) : (
        <Container maxWidth="sm">
          <PublisherCard
            title={origin.name}
            image={origin.icon}
            url={origin.host}
          />
          <div className="my-4">
            <SuccessMessage message={successMessage} onClose={close} />
          </div>
        </Container>
      )}
    </div>
  );
}

export default ConfirmKeysend;
