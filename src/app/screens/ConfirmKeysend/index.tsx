import BudgetControl from "@components/BudgetControl";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PaymentSummary from "@components/PaymentSummary";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
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
    getFiatValue,
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
        const res = await getFiatValue(amount);
        setFiatAmount(res);
      }
    })();
  }, [amount, showFiat, getFiatValue]);

  useEffect(() => {
    (async () => {
      const res = await getFiatValue(budget);
      setFiatBudgetAmount(res);
    })();
  }, [budget, showFiat, getFiatValue]);

  async function confirm() {
    if (rememberMe && budget) {
      await saveBudget();
    }
    try {
      setLoading(true);
      const payment = await utils.call(
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

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      {!successMessage ? (
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

              <BudgetControl
                fiatAmount={fiatBudgetAmount}
                remember={rememberMe}
                onRememberChange={(event) => {
                  setRememberMe(event.target.checked);
                }}
                budget={budget}
                onBudgetChange={(event) => setBudget(event.target.value)}
              />
            </div>
          </div>
          <ConfirmOrCancel
            disabled={loading}
            loading={loading}
            onConfirm={confirm}
            onCancel={reject}
          />
        </Container>
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
