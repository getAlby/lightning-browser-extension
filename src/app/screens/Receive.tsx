import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { CopyIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import QRCode from "react-qr-code";
import { Tab } from "@headlessui/react";

import utils from "../../common/lib/utils";

import Button from "../components/Button";
import IconButton from "../components/IconButton";
import Input from "../components/Form/Input";
import CurrencyInput from "../components/Form/CurrencyInput";
import Header from "../components/Header";

const AMOUNT_TYPES = ["Fixed", "Dynamic"];
const initialFormdata = {
  amount: "",
  defaultAmount: "",
  minimumAmount: "",
  maximumAmount: "",
  description: "",
  expiration: "",
};

function Receive() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormdata);
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<{ paymentRequest: string }>();
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [amountType, setAmountType] = useState(AMOUNT_TYPES[0].toLowerCase());

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
      if (e instanceof Error) {
        alert(e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function renderInvoice() {
    if (!invoice) return null;
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
                if (e instanceof Error) {
                  alert(e.message);
                }
              }
            }}
            icon={<CopyIcon className="w-6 h-6" />}
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
            onClick={() => navigate("/")}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      />
      <div className="p-4 max-w-screen-sm mx-auto">
        {invoice ? (
          renderInvoice()
        ) : (
          <>
            <Tab.Group
              onChange={(index) => {
                setFormData(initialFormdata);
                setAmountType(AMOUNT_TYPES[index].toLowerCase());
              }}
            >
              <Tab.List className="mb-4 group p-0.5 rounded-lg grid grid-cols-2 bg-gray-100 hover:bg-gray-200">
                {AMOUNT_TYPES.map((tab) => (
                  <Tab
                    key={tab}
                    className={({ selected }) =>
                      `p-1.5 text-sm font-medium rounded-md focus:outline-none ${
                        selected
                          ? "bg-white shadow-sm ring-1 ring-black ring-opacity-5 focus-visible:ring-2 focus-visible:ring-orange-bitcoin"
                          : "text-gray-600"
                      }`
                    }
                  >
                    {tab}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel>
                  <label
                    htmlFor="amount"
                    className="block font-medium text-gray-700"
                  >
                    Amount
                  </label>
                  <div className="mt-1 mb-4">
                    <CurrencyInput
                      name="amount"
                      placeholder="Amount in Satoshi..."
                      type="text"
                      value={formData.amount}
                      onChange={handleChange}
                    />
                  </div>
                  <label
                    htmlFor="description"
                    className="block font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <div className="mt-1 mb-4">
                    <Input
                      name="description"
                      placeholder="For e.g. who is sending this payment?"
                      type="text"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </Tab.Panel>
                <Tab.Panel>
                  <label
                    htmlFor="defaultAmount"
                    className="block font-medium text-gray-700"
                  >
                    Default amount
                  </label>
                  <div className="mt-1 mb-4">
                    <CurrencyInput
                      name="defaultAmount"
                      placeholder="Amount in Satoshi..."
                      type="text"
                      value={formData.defaultAmount}
                      onChange={handleChange}
                    />
                  </div>
                  <label
                    htmlFor="minimumAmount"
                    className="block font-medium text-gray-700"
                  >
                    Min
                  </label>
                  <div className="mt-1 mb-4">
                    <CurrencyInput
                      name="minimumAmount"
                      placeholder="Amount in Satoshi..."
                      type="text"
                      value={formData.minimumAmount}
                      onChange={handleChange}
                    />
                  </div>
                  <label
                    htmlFor="maximumAmount"
                    className="block font-medium text-gray-700"
                  >
                    Max
                  </label>
                  <div className="mt-1 mb-4">
                    <CurrencyInput
                      name="maximumAmount"
                      placeholder="Amount in Satoshi..."
                      type="text"
                      value={formData.maximumAmount}
                      onChange={handleChange}
                    />
                  </div>
                  <label
                    htmlFor="description"
                    className="block font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <div className="mt-1 mb-4">
                    <Input
                      name="description"
                      placeholder="For e.g. who is sending this payment?"
                      type="text"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>

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
                  navigate("/");
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
