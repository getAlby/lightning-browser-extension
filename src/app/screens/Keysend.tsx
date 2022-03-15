import { Fragment, useState, MouseEvent, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Transition } from "@headlessui/react";

import { LNURLPaymentSuccessAction, OriginData } from "../../types";
import utils from "../../common/lib/utils";
import getOriginData from "../../extension/content-script/originData";
import { useAuth } from "../context/AuthContext";
import msg from "../../common/lib/msg";
import Checkbox from "../components/Form/Checkbox";
import TextField from "../components/Form/TextField";

import Button from "../components/Button";
import Input from "../components/Form/Input";
import PublisherCard from "../components/PublisherCard";

type Props = {
  origin?: OriginData;
  destination?: string;
  comment?: string;
  valueSat?: string;
};

function Keysend(props: Props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [origin] = useState(
    props.origin ||
      (searchParams.get("origin") &&
        JSON.parse(searchParams.get("origin") as string)) ||
      getOriginData()
  );
  const originRef = useRef(props.origin || getOriginData());
  const [comment, setComment] = useState(props.comment || "");
  const [amount, setAmount] = useState(props.valueSat || "");
  const [destination] = useState(
    props.destination || searchParams.get("destination")
  );
  const [budget, setBudget] = useState(
    ((parseInt(amount) || 0) * 10).toString()
  );
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [successAction, setSuccessAction] = useState<
    LNURLPaymentSuccessAction | undefined
  >();

  async function confirm() {
    if (rememberMe && budget) {
      await saveBudget();
    }
    try {
      setLoadingConfirm(true);
      const payment = await utils.call(
        "sendPaymentKeySend",
        { destination, amount, comment },
        {
          origin: {
            ...origin,
            name: destination,
          },
        }
      );
      console.log(payment);

      setSuccessAction({
        tag: "message",
        message: `Keysend paid! Preimage: ${payment.preimage}`,
      });

      auth.fetchAccountInfo(); // Update balance.
    } catch (e) {
      console.log(e);
      if (e instanceof Error) {
        alert(`Error: ${e.message}`);
      }
    } finally {
      setLoadingConfirm(false);
    }
  }

  function reject(e: MouseEvent) {
    e.preventDefault();
    if (!props.origin) {
      navigate(-1);
    }
  }

  function renderAmount() {
    return (
      <div className="mt-1 flex flex-col">
        <Input
          type="number"
          min={+0 / 1000}
          max={+1000000 / 1000}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="flex space-x-1.5 mt-2">
          <Button
            fullWidth
            label="100 sat⚡"
            onClick={() => setAmount("100")}
          />
          <Button
            fullWidth
            label="1K sat⚡"
            onClick={() => setAmount("1000")}
          />
          <Button
            fullWidth
            label="5K sat⚡"
            onClick={() => setAmount("5000")}
          />
          <Button
            fullWidth
            label="10K sat⚡"
            onClick={() => setAmount("10000")}
          />
        </div>
      </div>
    );
  }

  function renderComment() {
    return (
      <div className="flex flex-col">
        <Input
          type="text"
          placeholder="optional"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
          }}
        />
      </div>
    );
  }

  function elements() {
    const elements = [];
    elements.push(["Send payment to", destination]);
    elements.push(["Amount (Satoshi)", renderAmount()]);
    elements.push(["Comment", renderComment()]);
    return elements;
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

  function renderSuccessAction() {
    if (!successAction) return;
    let descriptionList;
    if (successAction.tag === "url") {
      descriptionList = [
        ["Description", successAction.description],
        [
          "Url",
          <>
            {successAction.url}
            <div className="mt-4">
              <Button
                onClick={() => {
                  if (successAction.url) utils.openUrl(successAction.url);
                }}
                label="Open"
                primary
              />
            </div>
          </>,
        ],
      ];
    } else if (successAction.tag === "message") {
      descriptionList = [["Message", successAction.message]];
    }

    return (
      <>
        <dl className="shadow bg-white dark:bg-gray-700 pt-4 px-4 rounded-lg mb-6 overflow-hidden">
          {descriptionList &&
            descriptionList.map(([dt, dd], i) => (
              <Fragment key={`dl-item-${i}`}>
                <dt className="text-sm font-semibold text-gray-500">{dt}</dt>
                <dd className="text-sm mb-4 dark:text-white">{dd}</dd>
              </Fragment>
            ))}
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
        {!successAction ? (
          <>
            <dl className="shadow bg-white dark:bg-gray-700 pt-4 px-4 rounded-lg mb-6 overflow-hidden">
              {elements().map(([t, d], i) => (
                <Fragment key={`element-${i}`}>
                  <dt className="text-sm font-semibold text-gray-500">{t}</dt>
                  <dd className="text-sm mb-4 dark:text-white">{d}</dd>
                </Fragment>
              ))}
            </dl>
            <div className="text-center">
              <div className="mb-5">
                <Button
                  onClick={confirm}
                  label="Confirm"
                  fullWidth
                  primary
                  loading={loadingConfirm}
                  disabled={loadingConfirm || !amount}
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
          renderSuccessAction()
        )}
      </div>
    </div>
  );
}

export default Keysend;
