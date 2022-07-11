import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import SatButtons from "@components/SatButtons";
import SuccessMessage from "@components/SuccessMessage";
import Input from "@components/form/Input";
import { Fragment, useState, MouseEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Container from "~/app/components/Container";
import { useAccount } from "~/app/context/AccountContext";
import utils from "~/common/lib/utils";

type Props = {
  destination?: string;
  customRecords?: Record<string, string>;
  valueSat?: string;
};

function Keysend(props: Props) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAccount();
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
      console.error(e);
      if (e instanceof Error) {
        toast.error(`Error: ${e.message}`);
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
        <SatButtons onClick={setAmount} />
      </div>
    );
  }

  function elements() {
    const elements = [];
    elements.push(["Send payment to", destination]);
    elements.push(["Amount (Satoshis)", renderAmount()]);
    return elements;
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
      <div className="py-4">
        <Container maxWidth="sm">
          {!successMessage ? (
            <>
              <dl className="shadow bg-white dark:bg-surface-02dp pt-4 px-4 rounded-lg mb-6 overflow-hidden">
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
            <SuccessMessage message={successMessage} onClose={reject} />
          )}
        </Container>
      </div>
    </div>
  );
}

export default Keysend;
