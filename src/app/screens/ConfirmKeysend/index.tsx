import { useState, MouseEvent, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Transition } from "@headlessui/react";
import PaymentSummary from "../../components/PaymentSummary";
import utils from "../../../common/lib/utils";
import getOriginData from "../../../extension/content-script/originData";
import msg from "../../../common/lib/msg";
import Checkbox from "../../components/Form/Checkbox";
import TextField from "../../components/Form/TextField";

import Button from "../../components/Button";
import PublisherCard from "../../components/PublisherCard";

import type { OriginData } from "../../../types";

type Props = {
  origin?: OriginData;
  destination?: string;
  customRecords?: Record<string, string>;
  valueSat?: string;
};

function Keysend(props: Props) {
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
  const [destination] = useState(
    props.destination || searchParams.get("destination")
  );
  const [budget, setBudget] = useState(
    ((parseInt(amount) || 0) * 10).toString()
  );
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
        alert(`Error: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  function reject(e: MouseEvent) {
    e.preventDefault();
    if (props.origin) {
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

  function renderSuccessMessage() {
    return (
      <>
        <dl className="shadow bg-white dark:bg-gray-700 pt-4 px-4 rounded-lg mb-6 overflow-hidden">
          <dt className="text-sm font-semibold text-gray-500">Message</dt>
          <dd className="text-sm mb-4 dark:text-white">{successMessage}</dd>
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
        title={origin.name}
        description={origin.description}
        image={origin.icon}
      />
      <div className="p-4 max-w-screen-sm mx-auto">
        {!successMessage ? (
          <>
            <div className="mb-8">
              <PaymentSummary
                amount={amount}
                description={`Send payment to ${destination}`}
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
                className="underline text-sm text-gray-500"
                href="#"
                onClick={reject}
              >
                Cancel
              </a>
            </div>
          </>
        ) : (
          renderSuccessMessage()
        )}
      </div>
    </div>
  );
}

export default Keysend;
