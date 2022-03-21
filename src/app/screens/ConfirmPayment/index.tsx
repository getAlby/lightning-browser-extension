import { Transition } from "@headlessui/react";
import { parsePaymentRequest } from "invoices";
import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import msg from "../../../common/lib/msg";
import utils from "../../../common/lib/utils";
import getOriginData from "../../../extension/content-script/originData";
import type { OriginData } from "../../../types";
import Button from "../../components/Button";
import Checkbox from "../../components/Form/Checkbox";
import PaymentSummary from "../../components/PaymentSummary";
import PublisherCard from "../../components/PublisherCard";
import { useAuth } from "../../context/AuthContext";
import TextField from "../../components/Form/TextField";

export type Props = {
  origin?: OriginData;
  paymentRequest?: string;
};

function ConfirmPayment(props: Props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const invoiceRef = useRef(
    parsePaymentRequest({
      request:
        props.paymentRequest || (searchParams.get("paymentRequest") as string),
    })
  );
  const originRef = useRef(props.origin || getOriginData());
  const paymentRequestRef = useRef(
    props.paymentRequest || searchParams.get("paymentRequest")
  );
  const [budget, setBudget] = useState(
    ((invoiceRef.current?.tokens || 0) * 10).toString()
  );
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [succesMessage, setSuccessMessage] = useState("");

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
      if (e instanceof Error) alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function reject(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (props.paymentRequest && props.origin) {
      msg.error("User rejected");
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

  function renderSuccesMessage() {
    return (
      <>
        <dl className="shadow bg-white dark:bg-gray-700 pt-4 px-4 rounded-lg mb-6 overflow-hidden">
          <dt className="text-sm font-semibold text-gray-500">Message</dt>
          <dd className="text-sm mb-4 dark:text-white">{succesMessage}</dd>
        </dl>
        <div className="text-center">
          <button
            className="underline text-sm text-gray-500"
            onClick={() => window.close()}
          >
            Close
          </button>
        </div>
      </>
    );
  }

  return (
    <div>
      <PublisherCard
        title={originRef.current.name}
        image={originRef.current.icon}
      />

      <div className="p-4 max-w-screen-sm mx-auto">
        {!succesMessage ? (
          <>
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
                  You may set a balance to not be asked for confirmation on
                  payments until it is exhausted.
                </p>
                <div>
                  <TextField
                    id="budget"
                    label="Budget"
                    placeholder="sat"
                    value={budget}
                    type="number"
                    onChange={(event) => setBudget(event.target.value)}
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
          </>
        ) : (
          renderSuccesMessage()
        )}
      </div>
    </div>
  );
}

export default ConfirmPayment;
