import { CaretLeftIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import Button from "@components/Button";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import ContentMessage from "@components/ContentMessage";
import Header from "@components/Header";
import IconButton from "@components/IconButton";
import PublisherCard from "@components/PublisherCard";
import ResultCard from "@components/ResultCard";
import SatButtons from "@components/SatButtons";
import TextField from "@components/form/TextField";
import { useEffect, useState, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Container from "~/app/components/Container";
import { useAccount } from "~/app/context/AccountContext";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import utils from "~/common/lib/utils";

function Keysend() {
  const {
    isLoading: isLoadingSettings,
    settings,
    getFiatValue,
  } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;
  const navState = useNavigationState();
  const navigate = useNavigate();
  const auth = useAccount();
  const [amount, setAmount] = useState(navState.args?.amount || "");
  const customRecords = navState.args?.customRecords;
  const destination = navState.args?.destination as string;
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [fiatAmount, setFiatAmount] = useState("");

  const { t } = useTranslation("translation", { keyPrefix: "keysend" });
  const { t: tCommon } = useTranslation("common");

  useEffect(() => {
    (async () => {
      if (showFiat && amount) {
        const res = await getFiatValue(amount);
        setFiatAmount(res);
      }
    })();
  }, [amount, showFiat, getFiatValue]);

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

  function close(e: MouseEvent) {
    // will never be reached via prompt
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
        <Container justifyBetween maxWidth="sm">
          <ResultCard
            isSuccess
            message={
              !destination
                ? successMessage
                : `${amount} SATS ${
                    showFiat ? `(${fiatAmount})` : ``
                  } ${tCommon("were_sent_to")} ${destination}`
            }
          />
          <div className="my-4">
            <Button
              onClick={close}
              label={tCommon("actions.close")}
              fullWidth
            />
          </div>
        </Container>
      )}
    </div>
  );
}

export default Keysend;
