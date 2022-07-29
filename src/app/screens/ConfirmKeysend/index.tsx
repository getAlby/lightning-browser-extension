import BudgetControl from "@components/BudgetControl";
import PaymentSummary from "@components/PaymentSummary";
import SuccessMessage from "@components/SuccessMessage";
import ConfirmOrCancel from "@components/new/ConfirmOrCancel";
import PublisherCard from "@components/new/PublisherCard";
import { useState, MouseEvent, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSettings } from "~/app/context/SettingsContext";
import { USER_REJECTED_ERROR } from "~/common/constants";
import msg from "~/common/lib/msg";
import utils from "~/common/lib/utils";
import { getFiatValue } from "~/common/utils/currencyConvert";
import getOriginData from "~/extension/content-script/originData";
import type { OriginData } from "~/types";

type Props = {
  origin?: OriginData;
  destination?: string;
  customRecords?: Record<string, string>;
  valueSat?: string;
};

function Keysend(props: Props) {
  const { isLoading: isLoadingSettings, settings } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [rememberMe, setRememberMe] = useState(false);
  const [origin] = useState(
    props.origin ||
      (searchParams.get("origin") &&
        JSON.parse(searchParams.get("origin") as string)) ||
      getOriginData()
  );
  const originRef = useRef(props.origin || getOriginData());
  const [customRecords] = useState(props.customRecords || {});
  const [amount] = useState(props.valueSat || "");
  const [fiatAmount, setFiatAmount] = useState("");
  const [destination] = useState(
    props.destination || searchParams.get("destination")
  );
  const [budget, setBudget] = useState(
    ((parseInt(amount) || 0) * 10).toString()
  );
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
      setSuccessMessage(`Payment sent! Preimage: ${payment.preimage}`);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`Error: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  function reject(e: MouseEvent) {
    e.preventDefault();
    if (props.origin) {
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
          title={origin.name}
          description={origin.description}
          image={origin.icon}
        />
      </div>
      {!successMessage ? (
        <div className="flex flex-col justify-between h-3/5">
          <div className="pt-4 px-4">
            <div className="mb-8">
              <PaymentSummary
                amount={amount}
                description={`Send payment to ${destination}`}
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

export default Keysend;
