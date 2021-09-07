import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import CaretLeftIcon from "@bitcoin-design/bitcoin-icons/svg/filled/caret-left.svg";

import utils from "../../common/lib/utils";
import getOriginData from "../../extension/content-script/originData";

import Button from "../components/Button";
import IconButton from "../components/IconButton";
import Input from "../components/Form/Input";
import Header from "../components/Header";

function Send() {
  const [invoice, setInvoice] = useState("");
  const history = useHistory();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (invoice) {
      utils.call(
        "sendPayment",
        { paymentRequest: invoice },
        { origin: getOriginData() }
      );
    }
  }

  return (
    <div>
      <Header
        title="Send a payment"
        headerLeft={
          <IconButton
            onClick={() => history.goBack()}
            icon={
              <img
                className="w-4 h-4"
                src={CaretLeftIcon}
                alt=""
                aria-hidden="true"
              />
            }
          />
        }
      />
      <form className="px-4" onSubmit={handleSubmit}>
        <label
          htmlFor="invoice"
          className="mt-6 block font-medium text-gray-700"
        >
          Lightning Invoice
        </label>
        <div className="mt-1 mb-4">
          <Input
            name="invoice"
            placeholder="Paste invoice"
            value={invoice}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setInvoice(event.target.value)
            }
          />
        </div>
        <Button type="submit" label="View invoice" primary fullWidth />
      </form>
    </div>
  );
}

export default Send;
