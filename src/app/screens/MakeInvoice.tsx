import SatButtons from "@components/SatButtons";
import TextField from "@components/form/TextField";
import ConfirmOrCancel from "@components/new/ConfirmOrCancel";
import PublisherCard from "@components/new/PublisherCard";
import React, { useState } from "react";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import type { RequestInvoiceArgs } from "~/types";

type Origin = {
  name: string;
  host: string;
  icon: string;
};

type Props = {
  amountEditable: boolean;
  memoEditable: boolean;
  invoiceAttributes: RequestInvoiceArgs;
  origin: Origin;
};

const Dt = ({ children }: { children: React.ReactNode }) => (
  <dt className="font-medium text-gray-800 dark:text-white">{children}</dt>
);

const Dd = ({ children }: { children: React.ReactNode }) => (
  <dd className="mb-4 text-gray-600 dark:text-neutral-500">{children}</dd>
);

function MakeInvoice({
  amountEditable,
  memoEditable,
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
    msg.error(USER_REJECTED_ERROR);
  }

  return (
    <div className="overflow-y-auto no-scrollbar h-full">
      <div className="h-2/5 border-b border-gray-200 dark:border-neutral-500">
        <PublisherCard title={origin.name} image={origin.icon} />
      </div>
      <div className="flex flex-col justify-between h-3/5">
        <div className="pt-4 px-4">
          <p className="font-semibold text-gray-500">
            {origin.host} requests an invoice:
          </p>
          <div className="mt-4">
            {amountEditable && (
              <div className="mb-4">
                <TextField
                  id="amount"
                  label="Amount"
                  type="number"
                  min={invoiceAttributes.minimumAmount}
                  max={invoiceAttributes.maximumAmount}
                  value={value}
                  onChange={(e) => handleValueChange(e.target.value)}
                />
                <SatButtons onClick={handleValueChange} />
              </div>
            )}
            {!amountEditable && (
              <dl className="overflow-hidden">
                <Dt>Amount</Dt>
                <Dd>{invoiceAttributes.amount}</Dd>
              </dl>
            )}
            {error && <p className="mt-1 text-red-500">{error}</p>}
          </div>
          <div className="mb-4">
            {memoEditable && (
              <TextField
                id="memo"
                label="Memo"
                value={memo}
                onChange={handleMemoChange}
              />
            )}
            {!memoEditable && (
              <dl className="dark:bg-surface-02dp overflow-hidden">
                <Dt>Memo</Dt>
                <Dd>{invoiceAttributes.memo}</Dd>
              </dl>
            )}
          </div>
        </div>

        <div className="text-center p-2">
          <ConfirmOrCancel
            disabled={!value || loading || Boolean(error)}
            loading={loading}
            onConfirm={confirm}
            onCancel={reject}
          />
        </div>
      </div>
    </div>
  );
}

export default MakeInvoice;
