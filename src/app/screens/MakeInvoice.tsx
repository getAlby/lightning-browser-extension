import React, { useState } from "react";

import Button from "../components/Button";
import TextField from "../components/Form/TextField";
import PublisherCard from "../components/PublisherCard";
import msg from "../../common/lib/msg";
import utils from "../../common/lib/utils";
import type { RequestInvoiceArgs } from "../../types";

type Origin = {
  name: string;
  icon: string;
};

type Props = {
  invoiceAttributes: RequestInvoiceArgs;
  origin: Origin;
};

function MakeInvoice({ invoiceAttributes, origin }: Props) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(invoiceAttributes.defaultAmount);
  const [memo, setMemo] = useState(
    invoiceAttributes.defaultMemo || invoiceAttributes.memo
  );
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
    try {
      setLoading(true);
      const response = await utils.call("makeInvoice", {
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
          <div className="p-4 shadow bg-white border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600">
            <div>
              <TextField
                id="amount"
                label="Amount"
                type="number"
                min={invoiceAttributes.minimumAmount}
                max={invoiceAttributes.maximumAmount}
                value={value}
                onChange={(e) => handleValueChange(e.target.value)}
              />
              {invoiceAttributes.minimumAmount &&
                invoiceAttributes.maximumAmount && (
                  <div className="flex space-x-1.5 mt-2">
                    <Button
                      fullWidth
                      label="100 sat⚡"
                      onClick={() => handleValueChange("100")}
                    />
                    <Button
                      fullWidth
                      label="1K sat⚡"
                      onClick={() => handleValueChange("1000")}
                    />
                    <Button
                      fullWidth
                      label="5K sat⚡"
                      onClick={() => handleValueChange("5000")}
                    />
                    <Button
                      fullWidth
                      label="10K sat⚡"
                      onClick={() => handleValueChange("10000")}
                    />
                  </div>
                )}
              {error && <p className="mt-1 text-red-500">{error}</p>}
            </div>

            <div className="mt-4">
              <TextField
                id="memo"
                label="Description"
                value={memo}
                onChange={handleMemoChange}
              />
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="mb-5">
            <Button
              onClick={confirm}
              label="Make Invoice"
              fullWidth
              primary
              loading={loading}
              disabled={!value || loading || Boolean(error)}
            />
          </div>

          <p className="mb-3 underline text-sm text-gray-300">
            Only create invoices for sites you trust.
          </p>

          <a
            className="underline text-sm text-gray-500"
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

export default MakeInvoice;
