import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import CaretLeftIcon from "@bitcoin-design/bitcoin-icons/svg/filled/caret-left.svg";
import CopyIcon from "@bitcoin-design/bitcoin-icons/svg/outline/copy.svg";
import QRCode from "react-qr-code";

import utils from "../../common/lib/utils";

import Button from "../components/Button";
import IconButton from "../components/IconButton";
import Input from "../components/Form/Input";
// import Select from "../components/Form/Select";
import Header from "../components/Header";

function Receive() {
  const history = useHistory();
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    expiration: "",
  });
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState();
  const [copyLabel, setCopyLabel] = useState("Copy");

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
      setLoading(true);
      const response = await utils.call("makeInvoice", {
        amount: formData.amount,
        memo: formData.description,
      });
      setInvoice(response);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  function renderInvoice() {
    return (
      <div>
        <div className="mb-8 p-8 bg-white rounded-lg shadow-sm ring-1 ring-black ring-opacity-5 flex justify-center items-center">
          <QRCode value={invoice.paymentRequest} level="M" />
        </div>
        <div className="mb-4 flex justify-center">
          <Button
            onClick={async () => {
              try {
                navigator.clipboard.writeText(invoice.paymentRequest);
                setCopyLabel("Copied!");
                setTimeout(() => {
                  setCopyLabel("Copy");
                }, 1000);
              } catch (e) {
                alert(e.message);
              }
            }}
            icon={
              <img
                className="w-6 h-6"
                src={CopyIcon}
                alt=""
                aria-hidden="true"
              />
            }
            label={copyLabel}
          />
        </div>
      </div>
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
              <label
                htmlFor="amount"
                className="block font-medium text-gray-700"
              >
                Amount
              </label>
              <div className="mt-1">
                <Input
                  name="amount"
                  placeholder="Amount in Satoshi..."
                  type="text"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block font-medium text-gray-700"
              >
                Description
              </label>
              <div className="mt-1">
                <Input
                  name="description"
                  placeholder="For e.g. who is sending this payment?"
                  type="text"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* <div className="mb-5">
          <label htmlFor="expiration" className="block font-medium text-gray-700">
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
                  loading={loading}
                  disabled={
                    loading ||
                    formData.amount === "" ||
                    formData.description === ""
                  }
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
