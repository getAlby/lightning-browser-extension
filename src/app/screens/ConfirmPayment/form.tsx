import BudgetControl from "@components/BudgetControl";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import PaymentSummary from "@components/PaymentSummary";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import type { PaymentRequestObject, TagsObject } from "bolt11";
import lightningPayReq from "bolt11";
import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import { getFiatValue } from "~/common/utils/currencyConvert";
import type { OriginData } from "~/types";

type Invoice = PaymentRequestObject & { tagsObject: TagsObject };

export type Props = {
  paymentRequest: string;
  origin: OriginData;
  isPrompt?: boolean;
};

function ConfirmPaymentForm({ origin, paymentRequest, isPrompt }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation("components", {
    keyPrefix: "confirmOrCancel",
  });
  const auth = useAccount();

  const { isLoading: isLoadingSettings, settings } = useSettings();
  const [budget, setBudget] = useState("");
  const [fiatAmount, setFiatAmount] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const showFiat = !isLoadingSettings && settings.showFiat;
  const invoice = useRef<Invoice>(lightningPayReq.decode(paymentRequest));

  useEffect(() => {
    if (invoice) {
      setBudget(((invoice.current.satoshis || 0) * 10).toString());
    }
  }, [invoice]);

  useEffect(() => {
    if (showFiat) {
      (async () => {
        const res = await getFiatValue(budget);
        setFiatAmount(res);
      })();
    }
  }, [budget, showFiat]);

  async function confirm() {
    if (rememberMe && budget) {
      await saveBudget();
    }

    try {
      setLoading(true);
      const response = await utils.call(
        "sendPayment",
        { paymentRequest },
        { origin }
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
    if (isPrompt) {
      msg.error(USER_REJECTED_ERROR);
    } else {
      navigate(-1);
    }
  }

  function saveBudget() {
    if (!budget || !origin) return;
    return msg.request("addAllowance", {
      totalBudget: parseInt(budget),
      host: origin.host,
      name: origin.name,
      imageURL: origin.icon,
    });
  }

  return (
    <>
      <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
        <ScreenHeader title={"Approve Payment"} />
        {!successMessage ? (
          <div className="h-full flex flex-col justify-between">
            <div>
              <PublisherCard
                title={origin.name}
                image={origin.icon}
                url={origin.host}
              />
              <div className="m-4">
                <div className="mb-4 p-4 shadow bg-white dark:bg-surface-02dp rounded-lg">
                  <PaymentSummary
                    amount={invoice.current?.satoshis}
                    description={invoice.current?.tagsObject.description}
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
          </div>
        ) : (
          <>
            <PublisherCard
              title={origin.name}
              image={origin.icon}
              url={origin.host}
            />
            <div className="m-4">
              <SuccessMessage
                message={successMessage}
                onClose={() => window.close()}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default ConfirmPaymentForm;
