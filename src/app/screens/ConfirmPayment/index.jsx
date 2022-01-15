import { useState, useRef } from "react";
import { Transition } from "@headlessui/react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { parsePaymentRequest } from "invoices";

import Button from "../../components/Button";
import Checkbox from "../../components/Form/Checkbox";
import CurrencyInput from "../../components/Form/CurrencyInput";
import PaymentSummary from "../../components/PaymentSummary";
import PublisherCard from "../../components/PublisherCard";
import msg from "../../../common/lib/msg";
import utils from "../../../common/lib/utils";
import getOriginData from "../../../extension/content-script/originData";

function ConfirmPayment(props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invoiceRef = useRef(
    parsePaymentRequest({
      request: props.paymentRequest || searchParams.get("paymentRequest"),
    })
  );
  const originRef = useRef(props.origin || getOriginData());
  const paymentRequestRef = useRef(
    props.paymentRequest || searchParams.get("paymentRequest")
  );
  const [budget, setBudget] = useState((invoiceRef.current?.tokens || 0) * 10);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

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
      msg.reply(response);
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function reject(e) {
    e.preventDefault();
    if (props.paymentRequest && props.origin) {
      msg.error("User rejected");
    } else {
      navigate(-1);
    }
  }

  function saveBudget() {
    return msg.request("addAllowance", {
      totalBudget: budget,
      host: originRef.current.host,
      name: originRef.current.name,
      imageURL: originRef.current.icon,
    });
  }

  return (
    <div>
      <PublisherCard
        title={originRef.current.name}
        image={originRef.current.icon}
      />

      <div className="p-4 max-w-screen-sm mx-auto">
        <div className="mb-8">
          <PaymentSummary
            amount={invoiceRef.current?.tokens}
            description={invoiceRef.current?.description}
          />
        </div>

        <div className="mb-8">
          <div className="flex items-center">
            <Checkbox
              id="remember_me"
              name="remember_me"
              checked={rememberMe}
              onChange={(event) => {
                setRememberMe(event.target.checked);
              }}
            />
            <label
              htmlFor="remember_me"
              className="ml-2 block text-sm text-gray-900 font-medium dark:text-white"
            >
              Remember and set a budget
            </label>
          </div>

          <Transition
            show={rememberMe}
            enter="transition duration-100 ease-out"
            enterFrom="scale-95 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-95 opacity-0"
          >
            <p className="mt-4 mb-3 text-gray-500 text-sm">
              You may set a balance to not be asked for confirmation on payments
              until it is exhausted.
            </p>
            <div>
              <label
                htmlFor="budget"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                Budget
              </label>
              <CurrencyInput
                id="budget"
                name="budget"
                placeholder="sat"
                value={budget}
                onChange={(event) => {
                  setBudget(parseInt(event.target.value) || undefined);
                }}
              />
            </div>
          </Transition>
        </div>

        <div className="text-center">
          <div className="mb-5">
            <Button
              onClick={confirm}
              label="Confirm"
              fullWidth
              primary
              disabled={loading}
              loading={loading}
            />
          </div>

          <p className="mb-3 underline text-sm text-gray-300">
            Only connect with sites you trust.
          </p>

          <a
            className="underline text-sm text-gray-500 dark:text-gray-400"
            href="#"
            onClick={reject}
          >
            Cancel
          </a>
        </div>
      </div>
    </div>
  );
}

export default ConfirmPayment;
