import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import DualCurrencyField from "@components/form/DualCurrencyField";
import axios from "axios";
import { useState, useEffect, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import { getFiatValue } from "~/common/utils/currencyConvert";
import type { LNURLWithdrawServiceResponse } from "~/types";

function LNURLWithdraw() {
  const navigate = useNavigate();
  const navState = useNavigationState();

  const { isLoading: isLoadingSettings, settings } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;

  const details = navState.args?.lnurlDetails as LNURLWithdrawServiceResponse;
  const { minWithdrawable, maxWithdrawable } = details;

  const [valueSat, setValueSat] = useState(
    (maxWithdrawable && (+maxWithdrawable / 1000).toString()) || ""
  );
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fiatValue, setFiatValue] = useState("");

  useEffect(() => {
    if (valueSat !== "" && showFiat) {
      (async () => {
        const res = await getFiatValue(valueSat);
        setFiatValue(res);
      })();
    }
  }, [valueSat, showFiat]);

  async function confirm() {
    try {
      setErrorMessage("");
      setLoadingConfirm(true);

      const invoice = await api.makeInvoice({
        amount: parseInt(valueSat),
        memo: details.defaultDescription,
      });

      const response = await axios.get(details.callback, {
        params: {
          k1: details.k1,
          pr: invoice.paymentRequest,
        },
      });

      if (response.data.status === "OK") {
        setSuccessMessage("Withdraw request sent successfully.");
      } else {
        setErrorMessage(`Error: ${response.data.reason}`);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        toast.error(`Error: ${e.message}`);
        setErrorMessage(e.message);
      }
    } finally {
      setLoadingConfirm(false);
    }
  }

  function renderAmount() {
    if (minWithdrawable === maxWithdrawable) {
      return (
        <>
          <ContentMessage
            heading={`Amount (Satoshi)`}
            content={`${minWithdrawable / 1000} sats`}
          />

          {errorMessage && <p className="mt-1 text-red-500">{errorMessage}</p>}
        </>
      );
    } else {
      return (
        <div className="my-4 p-4 shadow bg-white dark:bg-surface-02dp rounded-lg overflow-hidden">
          <DualCurrencyField
            id="amount"
            label="Amount (Satoshi)"
            min={minWithdrawable / 1000}
            max={maxWithdrawable / 1000}
            value={valueSat}
            onChange={(e) => setValueSat(e.target.value)}
            fiatValue={fiatValue}
          />

          {errorMessage && <p className="mt-1 text-red-500">{errorMessage}</p>}
        </div>
      );
    }
  }

  function reject(e: MouseEvent) {
    e.preventDefault();
    if (navState.isPrompt) {
      msg.error(USER_REJECTED_ERROR);
    } else {
      navigate(-1);
    }
  }

  function close(e: MouseEvent) {
    e.preventDefault();
    if (navState.isPrompt) {
      window.close();
    } else {
      navigate(-1);
    }
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={"Withdraw"} />
      {!successMessage ? (
        <Container isScreenView maxWidth="sm">
          <div>
            <PublisherCard
              title={navState.origin.name}
              image={navState.origin.icon}
              url={details?.domain}
            />
            {renderAmount()}
          </div>
          <ConfirmOrCancel
            disabled={loadingConfirm || !valueSat}
            loading={loadingConfirm}
            onConfirm={confirm}
            onCancel={reject}
          />
        </Container>
      ) : (
        <Container maxWidth="sm">
          <PublisherCard
            title={navState.origin.name}
            image={navState.origin.icon}
          />
          <div className="my-4">
            <SuccessMessage message={successMessage} onClose={close} />
          </div>
        </Container>
      )}
    </div>
  );
}

export default LNURLWithdraw;
