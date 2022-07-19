import {
  CaretLeftIcon,
  CheckIcon,
} from "@bitcoin-design/bitcoin-icons-react/filled";
import { CopyIcon } from "@bitcoin-design/bitcoin-icons-react/outline";
import Button from "@components/Button";
import Container from "@components/Container";
// import Select from "@components/Form/Select";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import Loading from "@components/Loading";
import TextField from "@components/form/TextField";
import { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccount } from "~/app/context/AccountContext";
import api from "~/common/lib/api";
import utils from "~/common/lib/utils";
import { getFiatValue } from "~/common/utils/currencyConvert";
import { poll } from "~/common/utils/helpers";

import DualCurrencyField from "../components/form/DualCurrencyField";

function Receive() {
  const auth = useAccount();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: "0",
    description: "",
    expiration: "",
  });
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<{
    paymentRequest: string;
    rHash: string;
  }>();
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [paid, setPaid] = useState(false);
  const [pollingForPayment, setPollingForPayment] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const [fiatAmount, setFiatAmount] = useState("");

  useEffect(() => {
    if (formData.amount !== "") {
      (async () => {
        const res = await getFiatValue(formData.amount);
        setFiatAmount(res);
      })();
    }
  }, [formData]);

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
      shouldStopPolling: () => !mounted.current,
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
      const response = await api.makeInvoice({
        amount: formData.amount,
        memo: formData.description,
      });
      setInvoice(response);
      checkPayment(response.rHash);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
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
          <QRCode value={invoice.paymentRequest.toUpperCase()} level="M" />
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
                      toast.error(e.message);
                    }
                  }
                }}
                icon={<CopyIcon className="w-6 h-6 mr-2" />}
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
      <div className="py-4">
        <Container maxWidth="sm">
          <div className={`${paid ? "bg-green-bitcoin" : ""}`}>
            {invoice ? (
              renderInvoice()
            ) : (
              <>
                <div className="mb-4">
                  <DualCurrencyField
                    id="amount"
                    label="Amount"
                    placeholder="Amount in Satoshi..."
                    fiatValue={fiatAmount}
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

                <div className="text-center mb-4">
                  <div className="mb-4">
                    <Button
                      onClick={createInvoice}
                      label="Create Invoice"
                      fullWidth
                      primary
                      loading={loading}
                      disabled={loading || formData.amount === ""}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
}

export default Receive;
