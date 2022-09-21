import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import PublisherCard from "@components/PublisherCard";
import SatButtons from "@components/SatButtons";
import SuccessMessage from "@components/SuccessMessage";
import TextField from "@components/form/TextField";
import { useState, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Container from "~/app/components/Container";
import { useAccount } from "~/app/context/AccountContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import utils from "~/common/lib/utils";

function Keysend() {
  const navState = useNavigationState();
  const navigate = useNavigate();
  const auth = useAccount();
  const [amount, setAmount] = useState(navState.args?.amount || "");
  const customRecords = navState.args?.customRecords;
  const destination = navState.args?.destination;
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { t } = useTranslation("translation", { keyPrefix: "keysend" });
  const { t: tCommon } = useTranslation("common");

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

      setSuccessMessage(
        t("success", {
          preimage: payment.preimage,
        })
      );

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

  return (
    <div>
      <Header
        title={t("title")}
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
              {destination && <PublisherCard title={destination} />}

              <dl className="text-sm shadow bg-white dark:bg-surface-02dp pt-4 px-4 rounded-lg my-6 overflow-hidden">
                <dt className="font-medium text-gray-800 dark:text-white">
                  {t("receiver.label")}
                </dt>
                <dd className="mb-4 dark:text-white break-all">
                  {destination}
                </dd>
                <div className="font-semibold text-gray-500 mb-4">
                  <TextField
                    id="amount"
                    label={t("amount.label")}
                    type="number"
                    min={+0 / 1000}
                    max={+1000000 / 1000}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <SatButtons onClick={setAmount} />
                </div>
              </dl>
              <div className="text-center">
                <div className="mb-5">
                  <Button
                    onClick={confirm}
                    label={tCommon("actions.confirm")}
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
                  {tCommon("actions.cancel")}
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
