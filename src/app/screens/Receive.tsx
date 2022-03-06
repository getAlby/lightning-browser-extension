import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CaretLeftIcon,
  CheckIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { CopyIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import QRCode from "react-qr-code";
import Confetti from "react-confetti";

import utils from "../../common/lib/utils";
import { poll } from "../../common/utils/helpers";
import { useAuth } from "../context/AuthContext";

import Button from "../components/Button";
import IconButton from "../components/IconButton";
import TextField from "../components/Form/TextField";
// import Select from "../components/Form/Select";
import Header from "../components/Header";
import Loading from "../components/Loading";

function Receive() {
  const auth = useAuth();
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
  const [paid, setPaid] = useState(false);
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
      fn: () =>
        utils.call("checkPayment", { paymentHash }) as Promise<{
          paid: boolean;
        }>,
      validate: (payment) => payment.paid,
      interval: 3000,
      maxAttempts: 20,
    })
      .then(() => {
        setPaid(true);
        auth.fetchAccountInfo(); // Update balance.
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setPollingForPayment(false);
      });
  }

  async function createInvoice() {
    try {
      setLoading(true);
      const response = await utils.call<{
        paymentRequest: string;
        rHash: string;
      }>("makeInvoice", {
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
        <div className="relative p-8 bg-white rounded-lg shadow-sm ring-1 ring-black ring-opacity-5 flex justify-center items-center overflow-hidden">
          <QRCode value={invoice.paymentRequest} level="M" />
          {paid && (
            <div className="absolute inset-0 flex justify-center items-center bg-white/90">
              <div className="text-center">
                <div className="inline-block bg-green-bitcoin p-1 rounded-full mb-2">
                  <CheckIcon className="w-7 h-7 text-white" />
                </div>
                <p className="text-lg font-bold">Payment received!</p>
              </div>
            </div>
          )}
        </div>
        {!paid && (
          <>
            <div className="mt-8 mb-4 flex justify-center">
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
                <div className="flex items-center space-x-2 dark:text-white">
                  <Loading />
                  <span>waiting for payment...</span>
                </div>
              )}
              {!pollingForPayment && (
                <Button
                  onClick={() => checkPayment(invoice.rHash)}
                  label="Check payment status"
                />
              )}
            </div>
          </>
        )}
        {paid && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            onConfettiComplete={(confetti) => {
              confetti && confetti.reset();
            }}
            style={{ pointerEvents: "none" }}
          />
        )}
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
      <div
        className={`p-4 max-w-screen-sm mx-auto ${
          paid ? "bg-green-bitcoin" : ""
        }`}
      >
        {invoice ? (
          renderInvoice()
        ) : (
          <>
            <div className="mb-4">
              <TextField
                id="amount"
                label="Amount"
                placeholder="Amount in Satoshi..."
                type="number"
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <TextField
                id="description"
                label="Description"
                placeholder="For e.g. who is sending this payment?"
                onChange={handleChange}
              />
            </div>

            {/* <div className="mb-5">
          <label htmlFor="expiration" className="block font-medium text-gray-700">
            Expiration
          </label>
          <div className="mt-1">
            <Select
              name="expiration"
              id="expiration"
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Receive;
