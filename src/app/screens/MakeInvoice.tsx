import React, { useState } from "react";

import ConfirmOrCancel from "@components/ConfirmOrCancel";
import TextField from "@components/form/TextField";
import PublisherCard from "@components/PublisherCard";
import msg from "~/common/lib/msg";
import type { RequestInvoiceArgs } from "~/types";
import api from "~/common/lib/api";
import SatButtons from "@components/SatButtons";

type Origin = {
  name: string;
  host: string;
  icon: string;
};

type Props = {
  amountDisabled: boolean;
  memoDisabled: boolean;
  invoiceAttributes: RequestInvoiceArgs;
  origin: Origin;
};

function MakeInvoice({
  amountDisabled,
  memoDisabled,
  invoiceAttributes,
  origin,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(invoiceAttributes.amount || "");
  const [memo, setMemo] = useState(invoiceAttributes.memo || "");
  const [error, setError] = useState("");

  function handleValueChange(amount: string) {
    setError("");
    if (
      invoiceAttributes.minimumAmount &&
      parseInt(amount) < invoiceAttributes.minimumAmount
    ) {
      setError("Amount is less than minimum");
    } else if (
      invoiceAttributes.maximumAmount &&
      parseInt(amount) > invoiceAttributes.maximumAmount
    ) {
      setError("Amount exceeds maximum");
    }
    setValue(amount);
  }

  function handleMemoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMemo(e.target.value);
  }

  async function confirm() {
    if (!value) return;
    try {
      setLoading(true);
      const response = await api.makeInvoice({
        amount: value,
        memo: memo,
      });
      msg.reply(response);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function reject(e: React.MouseEvent) {
    e.preventDefault();
    msg.error("User rejected");
  }

  return (
    <div>
      <PublisherCard title={origin.name} image={origin.icon} />

      <div className="p-4">
        <div className="mb-8">
          <div className="p-4 shadow bg-white border-gray-200 rounded-lg dark:bg-surface-02dp dark:border-gray-600">
            <p className="font-semibold text-gray-500 mb-4">
              {origin.host} requests an invoice:
            </p>
            <div>
              <TextField
                id="amount"
                label="Amount"
                type="number"
                min={invoiceAttributes.minimumAmount}
                max={invoiceAttributes.maximumAmount}
                value={value}
                disabled={amountDisabled}
                onChange={(e) => handleValueChange(e.target.value)}
              />
              {!amountDisabled &&
                invoiceAttributes.minimumAmount &&
                invoiceAttributes.maximumAmount && (
                  <SatButtons onClick={handleValueChange} />
                )}
              {error && <p className="mt-1 text-red-500">{error}</p>}
            </div>
            <div className="mt-4">
              <TextField
                id="memo"
                label="Description"
                value={memo}
                disabled={memoDisabled}
                onChange={handleMemoChange}
              />
            </div>
          </div>
        </div>

        <ConfirmOrCancel
          disabled={!value || loading || Boolean(error)}
          loading={loading}
          onConfirm={confirm}
          onCancel={reject}
        />
      </div>
    </div>
  );
}

export default MakeInvoice;
