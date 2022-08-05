import BudgetControl from "@components/BudgetControl";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PaymentSummary from "@components/PaymentSummary";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import lightningPayReq from "bolt11";
import type { PaymentRequestObject, TagsObject } from "bolt11";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import { getFiatValue } from "~/common/utils/currencyConvert";
import getOriginData from "~/extension/content-script/originData";
import type { OriginData } from "~/types";

type Invoice = PaymentRequestObject & { tagsObject: TagsObject };

function ConfirmPayment() {
  const navState = useNavigationState();

  // TODO: separate form from paymentRequest/invoice/origin handling

  const [paymentRequest, setPaymentRequest] = useState("");
  const [invoice, setInvoice] = useState<Invoice>();
  const [origin, setOrigin] = useState<OriginData>();
  const [isPrompt, setIsPrompt] = useState(false);
  const [budget, setBudget] = useState("");
  const [fiatAmount, setFiatAmount] = useState("");

  useEffect(() => {
    if (navState.paymentRequest) {
      const paymentRequest = navState.paymentRequest;
      setPaymentRequest(paymentRequest);
      setInvoice(lightningPayReq.decode(paymentRequest));
      setOrigin(getOriginData());
      setIsPrompt(true);
    } else if (navState.args.paymentRequest && navState.origin) {
      const paymentRequest = navState.args.paymentRequest as string;
      setPaymentRequest(paymentRequest);
      setInvoice(lightningPayReq.decode(paymentRequest));
      setOrigin(navState.origin);
    } else {
      throw new Error("Not a paymentRequest LNUrl");
    }
  }, [navState]);

  const { isLoading: isLoadingSettings, settings } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;

  const navigate = useNavigate();
  const auth = useAccount();

  useEffect(() => {
    if (invoice) {
      setBudget(((invoice.satoshis || 0) * 10).toString());
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
      {origin && paymentRequest && invoice && (
        <div>
          <PublisherCard title={origin.name} image={origin.icon} />
          <div className="py-4">
            <Container maxWidth="sm">
              {!successMessage ? (
                <>
                  <h1 className="dark:text-white font-bold mb-4">
                    Approve payment
                  </h1>
                  <div className="mb-6">
                    <PaymentSummary
                      amount={invoice.satoshis}
                      description={invoice.tagsObject.description}
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

                  <ConfirmOrCancel
                    disabled={loading}
                    loading={loading}
                    onConfirm={confirm}
                    onCancel={reject}
                    label="Pay now"
                  />
                </>
              ) : (
                <SuccessMessage
                  message={successMessage}
                  onClose={() => window.close()}
                />
              )}
            </Container>
          </div>
        </div>
      )}
    </>
  );
}

export default ConfirmPayment;
