import React, { useState, MouseEvent } from "react";
import axios from "axios";

import msg from "../../common/lib/msg";

import Button from "../components/button";
import PublisherCard from "../components/PublisherCard";

type Props = {
  details: {
    minSendable: number;
    maxSendable: number;
    callback: string;
  };
  origin: {
    name: string;
    icon: string;
  };
};

function LNURLPay({ details, origin }: Props) {
  const [value, setValue] = useState<string | number>(details.minSendable);

  async function confirm() {
    try {
      const res = await axios.get(details.callback, {
        params: { amount: value },
      });
      return await msg.reply({
        confirmed: true,
      });
    } catch (e) {
      console.log(e.message);
    }
  }

  function reject(e: MouseEvent) {
    e.preventDefault();
    msg.error("User rejected");
  }

  function renderAmount() {
    if (details.minSendable === details.maxSendable) {
      return <p>{details.minSendable} satoshi</p>;
    } else {
      return (
        <div className="flex flex-col">
          <input
            type="range"
            min={details.minSendable}
            max={details.maxSendable}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <output className="mt-1 text-sm">{value} satoshi</output>
        </div>
      );
    }
  }

  return (
    <div>
      <PublisherCard title={origin.name} image={origin.icon} />
      <div className="p-6">
        <dl className="shadow p-4 rounded-lg mb-8">
          <dt className="font-semibold text-gray-500">Send payment to</dt>
          <dd className="mb-6">{origin.name}</dd>
          <dt className="font-semibold text-gray-500">Amount</dt>
          <dd>{renderAmount()}</dd>
        </dl>
        <div className="text-center">
          <div className="mb-5">
            <Button onClick={confirm} label="Confirm" fullWidth />
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
      </div>
    </div>
  );
}

export default LNURLPay;
