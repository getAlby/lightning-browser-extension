import { Fragment, useState, MouseEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import utils from "../../../common/lib/utils";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/Form/Input";
import Header from "../../components/Header";
import IconButton from "../../components/IconButton";

import Button from "../../components/Button";

type Props = {
  destination?: string;
  customRecords?: Record<string, string>;
  valueSat?: string;
};

function Keysend(props: Props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [amount, setAmount] = useState(props.valueSat || "");
  const [customRecords] = useState(props.customRecords || {});
  const [destination] = useState(
    props.destination || searchParams.get("destination")
  );
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function confirm() {
    try {
      setLoading(true);
      const payment = await utils.call(
        "keysend",
        { destination, amount, customRecords },
        {
          origin: {
            name: destination,
          },
        }
      );

      setSuccessMessage(`Payment sent! Preimage: ${payment.preimage}`);

      auth.fetchAccountInfo(); // Update balance.
    } catch (e) {
      console.log(e);
      if (e instanceof Error) {
        alert(`Error: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  function reject(e: MouseEvent) {
    e.preventDefault();
    navigate(-1);
  }

  function renderAmount() {
    return (
      <div className="mt-1 flex flex-col">
        <Input
          type="number"
          min={+0 / 1000}
          max={+1000000 / 1000}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="flex space-x-1.5 mt-2">
          <Button
            fullWidth
            label="100 sat⚡"
            onClick={() => setAmount("100")}
          />
          <Button
            fullWidth
            label="1K sat⚡"
            onClick={() => setAmount("1000")}
          />
          <Button
            fullWidth
            label="5K sat⚡"
            onClick={() => setAmount("5000")}
          />
          <Button
            fullWidth
            label="10K sat⚡"
            onClick={() => setAmount("10000")}
          />
        </div>
      </div>
    );
  }

  function elements() {
    const elements = [];
    elements.push(["Send payment to", destination]);
    elements.push(["Amount (Satoshi)", renderAmount()]);
    return elements;
  }

  function renderSuccessMessage() {
    return (
      <>
        <dl className="shadow bg-white dark:bg-gray-700 pt-4 px-4 rounded-lg mb-6 overflow-hidden">
          <dt className="text-sm font-semibold text-gray-500">Message</dt>
          <dd className="text-sm mb-4 dark:text-white break-all">
            {successMessage}
          </dd>
        </dl>
        <div className="text-center">
          <button className="underline text-sm text-gray-500" onClick={reject}>
            Close
          </button>
        </div>
      </>
    );
  }

  return (
    <div>
      <Header
        title="Send"
        headerLeft={
          <IconButton
            onClick={() => navigate("/send")}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      />
      <div className="p-4 max-w-screen-sm mx-auto">
        {!successMessage ? (
          <>
            <dl className="shadow bg-white dark:bg-gray-700 pt-4 px-4 rounded-lg mb-6 overflow-hidden">
              {elements().map(([t, d], i) => (
                <Fragment key={`element-${i}`}>
                  <dt className="text-sm font-semibold text-gray-500">{t}</dt>
                  <dd className="text-sm mb-4 dark:text-white break-all">
                    {d}
                  </dd>
                </Fragment>
              ))}
            </dl>
            <div className="text-center">
              <div className="mb-5">
                <Button
                  onClick={confirm}
                  label="Confirm"
                  fullWidth
                  primary
                  loading={loading}
                  disabled={loading || !amount}
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
          </>
        ) : (
          renderSuccessMessage()
        )}
      </div>
    </div>
  );
}

export default Keysend;
