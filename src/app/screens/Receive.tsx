import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { CopyIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import QRCode from "react-qr-code";

import utils from "../../common/lib/utils";
import { poll } from "../../common/utils/helpers";

import Button from "../components/Button";
import IconButton from "../components/IconButton";
import Input from "../components/Form/Input";
// import Select from "../components/Form/Select";
import Header from "../components/Header";
import Loading from "../components/Loading";

function Receive() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    expiration: "",
  });
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] =
    useState<{ paymentRequest: string; rHash: string }>();
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [paid, setPaid] = useState(true);
  const [pollingForPayment, setPollingForPayment] = useState(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  function checkPayment(paymentHash: string) {
    setPollingForPayment(true);
    poll({
      fn: () => utils.call("checkPayment", { paymentHash }),
      validate: (payment) => payment.paid,
      interval: 3000,
      maxAttempts: 20,
    })
      .then(() => {
        setPaid(true);
        // Update balance.
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setPollingForPayment(false);
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
      checkPayment(response.rHash);
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
        <div className="flex justify-center">
          {pollingForPayment && (
            <div className="flex items-center space-x-2">
              <Loading />
              <span>waiting for payment...</span>
            </div>
          )}
          {!paid && !pollingForPayment && (
            <Button
              onClick={() => checkPayment(invoice.rHash)}
              label="Check payment status"
            />
          )}
          {paid && <p>Payment received!</p>}
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
