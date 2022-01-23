import { useState, MouseEvent } from "react";
import axios from "axios";

import { LNURLWithdrawServiceResponse } from "../../types";
import getOriginData from "../../extension/content-script/originData";
import msg from "../../common/lib/msg";
import api from "../../common/lib/api";

import Button from "../components/Button";
import Input from "../components/Form/Input";
import PublisherCard from "../components/PublisherCard";

type Props = {
  details: LNURLWithdrawServiceResponse;
  origin?: {
    name: string;
    icon: string;
  };
};

function LNURLWithdraw(props: Props) {
  const [origin] = useState(props.origin || getOriginData());
  const { minWithdrawable, maxWithdrawable } = props.details;
  const [valueMSat, setValueMSat] = useState<number | undefined>(
    maxWithdrawable
  );
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function confirm() {
    try {
      setLoadingConfirm(true);
      const invoice = await api.makeInvoice({
        amount: valueMSat ? valueMSat / 1000 : 0,
        memo: props.details.defaultDescription,
      });

      await axios.get(props.details.callback, {
        params: {
          k1: props.details.k1,
          pr: invoice.paymentRequest,
        },
      });

      setSuccessMessage("Withdraw request sent successfully.");
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConfirm(false);
    }
  }

  function renderAmount() {
    if (minWithdrawable === maxWithdrawable) {
      return <p>{`${minWithdrawable / 1000} sat`}</p>;
    } else {
      return (
        <div className="mt-1 flex flex-col">
          <Input
            type="number"
            min={minWithdrawable / 1000}
            max={maxWithdrawable / 1000}
            value={valueMSat ? valueMSat / 1000 : undefined}
            onChange={(e) => {
              let newValue;
              if (e.target.value) {
                newValue = parseInt(e.target.value) * 1000;
              }
              setValueMSat(newValue);
            }}
          />
        </div>
      );
    }
  }

  function renderSuccess() {
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

  function reject(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    msg.error("User rejected");
  }

  return (
    <div>
      <h1 className="py-2 font-bold text-lg text-center">Withdraw</h1>
      <PublisherCard title={origin.name} image={origin.icon} />
      <div className="p-4 max-w-screen-sm mx-auto">
        {!successMessage ? (
          <>
            <dl className="shadow bg-white dark:bg-gray-700 pt-4 px-4 rounded-lg mb-6 overflow-hidden">
              <dt className="text-sm font-semibold text-gray-500">
                Amount (Satoshi)
              </dt>
              <dd className="text-sm mb-4 dark:text-white">{renderAmount()}</dd>
            </dl>
            <div className="text-center">
              <div className="mb-5">
                <Button
                  onClick={confirm}
                  label="Confirm"
                  fullWidth
                  primary
                  loading={loadingConfirm}
                  disabled={loadingConfirm || !valueMSat}
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
          renderSuccess()
        )}
      </div>
    </div>
  );
}

export default LNURLWithdraw;
