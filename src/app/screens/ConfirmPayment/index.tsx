import BudgetControl from "@components/BudgetControl";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PaymentSummary from "@components/PaymentSummary";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import lightningPayReq from "bolt11";
import { useEffect, useRef, useState } from "react";
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
import { getFiatValue } from "~/common/utils/currencyConvert";
import type { OriginData } from "~/types";

export type Props = {
  origin?: OriginData;
  paymentRequest?: string;
};

function ConfirmPayment(props: Props) {
  const { isLoading: isLoadingSettings, settings } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;
  const { t } = useTranslation("components", {
    keyPrefix: "confirmOrCancel",
  });

  const navState = useNavigationState();
  const paymentRequest = navState.args?.paymentRequest as string;

  const navigate = useNavigate();
  const auth = useAccount();

  const invoiceRef = useRef(lightningPayReq.decode(paymentRequest));
  const [budget, setBudget] = useState(
    ((invoiceRef.current?.satoshis || 0) * 10).toString()
  );
  const [fiatAmount, setFiatAmount] = useState("");

  useEffect(() => {
    if (showFiat) {
      (async () => {
        const res = await getFiatValue(budget);
        setFiatAmount(res);
      })();
    }
  }, [budget, showFiat]);

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
        { origin: navState.origin }
      );
      auth.fetchAccountInfo(); // Update balance.
      msg.reply(response);
      setSuccessMessage("Success, payment sent!");
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
    if (!budget) return;
    return msg.request("addAllowance", {
      totalBudget: parseInt(budget),
      host: navState.origin.host,
      name: navState.origin.name,
      imageURL: navState.origin.icon,
    });
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={"Approve Payment"} />
      {!successMessage ? (
        <Container isScreenView maxWidth="sm">
          <div>
            <PublisherCard
              title={navState.origin.name}
              image={navState.origin.icon}
              url={navState.origin.host}
            />
            <div className="my-4">
              <div className="mb-4 p-4 shadow bg-white dark:bg-surface-02dp rounded-lg">
                <PaymentSummary
                  amount={invoiceRef.current?.satoshis}
                  description={invoiceRef.current?.tagsObject.description}
                />
              </div>

              <BudgetControl
                fiatAmount={fiatAmount}
                remember={rememberMe}
                onRememberChange={(event) => {
                  setRememberMe(event.target.checked);
                }}
                budget={budget}
                onBudgetChange={(event) => setBudget(event.target.value)}
              />
            </div>
          </div>
          <div>
            <ConfirmOrCancel
              disabled={loading}
              loading={loading}
              onConfirm={confirm}
              onCancel={reject}
              label="Pay now"
            />
            <p className="mb-4 text-center text-sm text-gray-400">
              <em>{t("only_trusted")}</em>
            </p>
          </div>
        </Container>
      ) : (
        <Container maxWidth="sm">
          <PublisherCard
            title={navState.origin.name}
            image={navState.origin.icon}
            url={navState.origin.host}
          />
          <div className="my-4">
            <SuccessMessage
              message={successMessage}
              onClose={() => window.close()}
            />
          </div>
        </Container>
      )}
    </div>
  );
}

export default ConfirmPayment;
