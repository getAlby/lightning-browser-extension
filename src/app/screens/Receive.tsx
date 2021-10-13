import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import CaretLeftIcon from "@bitcoin-design/bitcoin-icons/svg/filled/caret-left.svg";

import utils from "../../common/lib/utils";

import Button from "../components/Button";
import IconButton from "../components/IconButton";
import Input from "../components/Form/Input";
import Select from "../components/Form/Select";
import Header from "../components/Header";

function Receive() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    expiration: "",
  });
  const [invoice, setInvoice] = useState();

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  async function createInvoice() {
    try {
      const response = await utils.call("makeInvoice", {
        amount: formData.amount,
        memo: formData.description,
      });
      setInvoice(response);
      console.log(response);
    } catch (e) {
      alert(e.message);
    }
  }

  function renderInvoice() {
    return (
      <>
        <p className="break-words mb-4">
          <strong>paymentRequest</strong> {invoice.paymentRequest}
        </p>
        <p className="break-words">
          <strong>rHash</strong> {invoice.rHash}
        </p>
      </>
    );
  }

  return (
    <div>
      <Header
        title="Receive"
        headerLeft={
          <IconButton
            onClick={() => history.push("/home")}
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
      <div className="p-4 max-w-screen-sm mx-auto">
        {invoice ? (
          renderInvoice()
        ) : (
          <>
            <div className="mt-2 mb-4">
              <label htmlFor="amount" className="block text-gray-700">
                Amount
              </label>
              <div className="mt-1">
                <Input
                  name="amount"
                  placeholder="Enter amount..."
                  type="text"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <Input
                  name="description"
                  placeholder="Who is sending this payment?"
                  type="text"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* <div className="mb-5">
          <label htmlFor="expiration" className="block text-gray-700">
            Expiration
          </label>
          <div className="mt-1">
            <Select
              name="expiration"
              value={formData.expiration}
              onChange={handleChange}
            >
              <option key="60" value="60">
                1 hour
              </option>
              <option key="120" value="120">
                2 hours
              </option>
              <option key="180" value="180">
                3 hours
              </option>
            </Select>
          </div>
        </div> */}

            <div className="text-center mb-4">
              <div className="mb-4">
                <Button
                  onClick={createInvoice}
                  label="Create Invoice"
                  fullWidth
                  primary
                />
              </div>
              <a
                className="underline text-sm text-gray-500"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  history.push("/home");
                }}
              >
                Cancel
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Receive;
