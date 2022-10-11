import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import ContentMessage from "@components/ContentMessage";
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
  const destination = navState.args?.destination as string;
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
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <Header
        title={t("title")}
        headerLeft={
          <IconButton
            onClick={() => navigate("/send")}
            icon={<CaretLeftIcon className="w-4 h-4" />}
          />
        }
      />
      {!successMessage ? (
        <>
          <Container justifyBetween maxWidth="sm">
            <div>
              {destination && <PublisherCard title={destination} />}
              <ContentMessage
                heading={t("receiver.label")}
                content={destination}
              />
              <div className="p-4 shadow bg-white dark:bg-surface-02dp rounded-lg overflow-hidden">
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
            </div>
            <ConfirmOrCancel
              label={tCommon("actions.confirm")}
              onConfirm={confirm}
              onCancel={reject}
              loading={loading}
              disabled={loading || !amount}
            />
          </Container>
        </>
      ) : (
        <Container maxWidth="sm">
          {destination && <PublisherCard title={destination} />}
          <div className="my-4">
            <SuccessMessage message={successMessage} onClose={reject} />
          </div>
        </Container>
      )}
    </div>
  );
}

export default Keysend;
