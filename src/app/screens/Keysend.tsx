import { Fragment, useState, MouseEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { LNURLPaymentSuccessAction } from "../../types";
import utils from "../../common/lib/utils";
import getOriginData from "../../extension/content-script/originData";
import { useAuth } from "../context/AuthContext";

import Button from "../components/Button";
import Input from "../components/Form/Input";
import PublisherCard from "../components/PublisherCard";

type Origin = {
  name: string;
  icon: string;
};

type Props = {
  origin?: Origin;
};

function Keysend(props: Props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [origin] = useState(
    props.origin ||
      (searchParams.get("origin") &&
        JSON.parse(searchParams.get("origin") as string)) ||
      getOriginData()
  );
  const [comment, setComment] = useState("");
  const [valueSat, setValueSat] = useState("");
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [successAction, setSuccessAction] = useState<
    LNURLPaymentSuccessAction | undefined
  >();

  async function confirm() {
    const pubkey = searchParams.get("destination");

    try {
      setLoadingConfirm(true);
      const payment = await utils.call(
        "sendPaymentKeySend",
        { pubkey, valueSat, comment },
        {
          origin: {
            ...origin,
            name: getRecipient(),
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

  function getRecipient() {
    return searchParams.get("destination");
  }

  function renderAmount() {
    return (
      <div className="mt-1 flex flex-col">
        <Input
          type="number"
          min={+0 / 1000}
          max={+1000000 / 1000}
          value={valueSat}
          onChange={(e) => setValueSat(e.target.value)}
        />
        <div className="flex space-x-1.5 mt-2">
          <Button
            fullWidth
            label="100 sat⚡"
            onClick={() => setValueSat("100")}
          />
          <Button
            fullWidth
            label="1K sat⚡"
            onClick={() => setValueSat("1000")}
          />
          <Button
            fullWidth
            label="5K sat⚡"
            onClick={() => setValueSat("5000")}
          />
          <Button
            fullWidth
            label="10K sat⚡"
            onClick={() => setValueSat("10000")}
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
          onChange={(e) => {
            setComment(e.target.value);
          }}
        />
      </div>
    );
  }

  function elements() {
    const elements = [];
    elements.push(["Send payment to", getRecipient()]);
    elements.push(["Amount (Satoshi)", renderAmount()]);
    elements.push(["Comment", renderComment()]);
    return elements;
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
                  disabled={loadingConfirm || !valueSat}
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
          renderSuccessAction()
        )}
      </div>
    </div>
  );
}

export default Keysend;
