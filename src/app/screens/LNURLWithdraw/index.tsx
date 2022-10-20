import Button from "@components/Button";
import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import ContentMessage from "@components/ContentMessage";
import PublisherCard from "@components/PublisherCard";
import ResultCard from "@components/ResultCard";
import DualCurrencyField from "@components/form/DualCurrencyField";
import axios from "axios";
import { useState, useEffect, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import type { LNURLWithdrawServiceResponse } from "~/types";

function LNURLWithdraw() {
  const { t } = useTranslation("translation", { keyPrefix: "lnurlwithdraw" });
  const { t: tCommon } = useTranslation("common");

  const navigate = useNavigate();
  const navState = useNavigationState();
  const {
    isLoading: isLoadingSettings,
    settings,
    getFiatValue,
  } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;

  const origin = navState.origin;
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
        const res = getFiatValue(valueSat);
        setFiatValue(res);
      })();
    }
  }, [valueSat, showFiat, getFiatValue]);

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

      if (response.data.status.toUpperCase() === "OK") {
        setSuccessMessage(
          t("success", {
            amount: `${valueSat} SATS ${showFiat ? `(${fiatValue})` : ``}`,
            sender: origin ? origin.name : details.domain,
          })
        );
        // ATTENTION: if this LNURL is called through `webln.lnurl` then we immediately return and return the response. This closes the window which means the user will NOT see the above successAction.
        // We assume this is OK when it is called through webln.
        if (navState.isPrompt) {
          msg.reply(response.data);
        }
      } else {
        setErrorMessage(`Error: ${response.data.reason}`);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
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
            heading={t("content_message.heading")}
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
            label={t("amount.label")}
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
    // will never be reached via prompt
    e.preventDefault();
    navigate(-1);
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      {!successMessage ? (
        <Container justifyBetween maxWidth="sm">
          <div>
            {origin ? (
              <PublisherCard
                title={origin.name}
                image={origin.icon}
                url={details.domain}
              />
            ) : (
              <PublisherCard title={details.domain} />
            )}
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
        <Container justifyBetween maxWidth="sm">
          <ResultCard isSuccess message={successMessage} />
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

export default LNURLWithdraw;
