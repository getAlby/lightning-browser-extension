import { useState, MouseEvent } from "react";
import axios from "axios";

import type { LNURLWithdrawServiceResponse } from "~/types";
import getOriginData from "~/extension/content-script/originData";
import msg from "~/common/lib/msg";
import api from "~/common/lib/api";
import { USER_REJECTED_ERROR } from "~/common/constants";

import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Input from "@components/form/Input";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";

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
  const [valueSat, setValueSat] = useState(
    (maxWithdrawable && (+maxWithdrawable / 1000).toString()) || ""
  );
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function confirm() {
    try {
      setErrorMessage("");
      setLoadingConfirm(true);
      const invoice = await api.makeInvoice({
        amount: parseInt(valueSat),
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
      if (e instanceof Error) {
        setErrorMessage(e.message);
      }
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
            value={valueSat}
            onChange={(e) => setValueSat(e.target.value)}
          />
          {errorMessage && <p className="mt-1 text-red-500">{errorMessage}</p>}
        </div>
      );
    }
  }

  function reject(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  return (
    <div>
      <h1 className="py-2 font-bold text-lg text-center">Withdraw</h1>
      <PublisherCard title={origin.name} image={origin.icon} />
      <div className="p-4 max-w-screen-sm mx-auto">
        {!successMessage ? (
          <>
            <dl className="shadow bg-white dark:bg-surface-02dp pt-4 px-4 rounded-lg mb-6 overflow-hidden">
              <dt className="text-sm font-semibold text-gray-500">
                Amount (Satoshi)
              </dt>
              <dd className="text-sm mb-4 dark:text-white">{renderAmount()}</dd>
            </dl>
            <ConfirmOrCancel
              disabled={loadingConfirm || !valueSat}
              loading={loadingConfirm}
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
      </div>
    </div>
  );
}

export default LNURLWithdraw;
