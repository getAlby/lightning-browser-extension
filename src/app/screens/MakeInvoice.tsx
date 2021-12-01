import React, { useState } from "react";

import Button from "../components/Button";
import Input from "../components/Form/Input";
import PaymentSummary from "../components/PaymentSummary";
import PublisherCard from "../components/PublisherCard";
import msg from "../../common/lib/msg";

type Origin = {
  name: string;
  icon: string;
};

type Props = {
  invoice: {
    amount?: string | number;
    defaultAmount?: string | number;
    minimumAmount?: string | number;
    maximumAmount?: string | number;
    defaultMemo?: string;
    memo?: string;
  };
  origin: Origin;
};

function MakeInvoice({ invoice, origin }: Props) {
  const [value, setValue] = useState(invoice.defaultAmount);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    if (
      invoice.minimumAmount &&
      e.target.valueAsNumber < invoice.minimumAmount
    ) {
      setError("Amount is less than minimum");
    } else if (
      invoice.maximumAmount &&
      e.target.valueAsNumber > invoice.maximumAmount
    ) {
      setError("Amount exceeds maximum");
    }
    setValue(e.target.value);
  }

  function confirm() {
    msg.reply(value);
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
          <PaymentSummary
            amount={
              <div className="mt-1 flex flex-col">
                <Input
                  type="number"
                  min={invoice.minimumAmount}
                  max={invoice.maximumAmount}
                  value={value}
                  onChange={handleChange}
                />
                {invoice.minimumAmount && invoice.maximumAmount && (
                  <input
                    className="mt-2"
                    type="range"
                    min={invoice.minimumAmount}
                    max={invoice.maximumAmount}
                    value={value}
                    onChange={handleChange}
                  />
                )}
                {error && <p className="text-red-500">{error}</p>}
              </div>
            }
            description={invoice.defaultMemo || invoice.memo}
          />
        </div>

        <div className="text-center">
          <div className="mb-5">
            <Button
              onClick={confirm}
              label="Make Invoice"
              fullWidth
              primary
              disabled={!value || Boolean(error)}
            />
          </div>

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
