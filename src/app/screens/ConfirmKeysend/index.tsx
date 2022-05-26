import { useState, MouseEvent, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import PaymentSummary from "@components/PaymentSummary";
import utils from "~/common/lib/utils";
import getOriginData from "~/extension/content-script/originData";
import msg from "~/common/lib/msg";
import { USER_REJECTED_ERROR } from "~/common/constants";

import BudgetControl from "@components/BudgetControl";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import SuccessMessage from "@components/SuccessMessage";

import type { OriginData } from "~/types";
import { useCurrency } from "~/app/context/CurrencyContext";

type Props = {
  origin?: OriginData;
  destination?: string;
  customRecords?: Record<string, string>;
  valueSat?: string;
};

function Keysend(props: Props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getFiatValue } = useCurrency();
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
    getFiatValue(budget).then((res) => setFiatAmount(res));
  }, [budget, getFiatValue]);

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
      console.log(e);
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
    <div>
      <PublisherCard
        title={origin.name}
        description={origin.description}
        image={origin.icon}
      />
      <div className="py-4">
        <Container maxWidth="sm">
          {!successMessage ? (
            <>
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
              <ConfirmOrCancel
                disabled={loading}
                loading={loading}
                onConfirm={confirm}
                onCancel={reject}
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
  );
}

export default Keysend;
