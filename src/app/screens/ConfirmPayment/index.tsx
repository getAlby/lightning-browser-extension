import BudgetControl from "@components/BudgetControl";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import PaymentSummary from "@components/PaymentSummary";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import lightningPayReq from "bolt11";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import { getFiatValue } from "~/common/utils/currencyConvert";
import getOriginData from "~/extension/content-script/originData";
import type { OriginData } from "~/types";

export type Props = {
  origin?: OriginData;
  paymentRequest?: string;
};

function ConfirmPayment(props: Props) {
  const { isLoading: isLoadingSettings, settings } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAccount();

  const invoiceRef = useRef(
    lightningPayReq.decode(
      props.paymentRequest || (searchParams.get("paymentRequest") as string)
    )
  );
  const originRef = useRef(props.origin || getOriginData());
  const paymentRequestRef = useRef(
    props.paymentRequest || searchParams.get("paymentRequest")
  );
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
        { paymentRequest: paymentRequestRef.current },
        { origin: originRef.current }
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
    if (props.paymentRequest && props.origin) {
      msg.error(USER_REJECTED_ERROR);
    } else {
      navigate(-1);
    }
  }

  function saveBudget() {
    if (!budget) return;
    return msg.request("addAllowance", {
      totalBudget: parseInt(budget),
      host: originRef.current.host,
      name: originRef.current.name,
      imageURL: originRef.current.icon,
    });
  }

  return (
    <div className="overflow-y-auto no-scrollbar h-full">
      <div className="h-2/5 border-b border-gray-200 dark:border-neutral-500">
        <PublisherCard
          title={originRef.current.name}
          image={originRef.current.icon}
        />
      </div>
      {!successMessage ? (
        <div className="flex flex-col justify-between h-3/5">
          <div className="pt-4 px-4">
            <h1 className="dark:text-white font-bold mb-4">Approve payment</h1>
            <div className="mb-6">
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

          <div className="text-center p-2">
            <ConfirmOrCancel
              disabled={loading}
              loading={loading}
              onConfirm={confirm}
              onCancel={reject}
              label="Pay now"
            />
          </div>
        </div>
      ) : (
        <div className="m-6">
          <SuccessMessage
            message={successMessage}
            onClose={() => window.close()}
          />
        </div>
      )}
    </div>
  );
}

export default ConfirmPayment;
