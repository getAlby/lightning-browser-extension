import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import SatButtons from "@components/SatButtons";
import DualCurrencyField from "@components/form/DualCurrencyField";
import TextField from "@components/form/TextField";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ScreenHeader from "~/app/components/ScreenHeader";
import toast from "~/app/components/Toast";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import { numSatsInBtc } from "~/common/utils/currencyConvert";
import type { OriginData, RequestInvoiceArgs } from "~/types";

const Dt = ({ children }: { children: React.ReactNode }) => (
  <dt className="font-medium text-gray-800 dark:text-white">{children}</dt>
);

const Dd = ({ children }: { children: React.ReactNode }) => (
  <dd className="mb-4 text-gray-600 dark:text-neutral-500">{children}</dd>
);

function MakeInvoice() {
  const navState = useNavigationState();
  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
    getCurrencyRate,
  } = useSettings();
  const showFiat = !isLoadingSettings && settings.showFiat;

  const origin = navState.origin as OriginData;
  const invoiceAttributes = navState.args
    ?.invoiceAttributes as RequestInvoiceArgs;
  const amountEditable = navState.args?.amountEditable;
  const memoEditable = navState.args?.memoEditable;
  const [loading, setLoading] = useState(false);
  const [valueSat, setValueSat] = useState(invoiceAttributes.amount || "");
  const [fiatValue, setFiatValue] = useState("");
  const [valueFiatString, setValueFiatString] = useState("");
  const [isSatsPrimary, setIsSatsPrimary] = useState(true);
  const [memo, setMemo] = useState(invoiceAttributes.memo || "");
  const [error, setError] = useState("");
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "make_invoice",
  });

  useEffect(() => {
    if (valueSat !== "" && showFiat && isSatsPrimary) {
      (async () => {
        const formattedFiat = await getFormattedFiat(valueSat);
        setFiatValue(formattedFiat);
        const numericFiat = formattedFiat.replace(/[^0-9.]/g, "");
        setValueFiatString(numericFiat);
      })();
    } else if (valueSat === "" && isSatsPrimary) {
      setFiatValue("");
      setValueFiatString("");
    }
  }, [valueSat, showFiat, getFormattedFiat, isSatsPrimary]);

  useEffect(() => {
    if (!isSatsPrimary && valueFiatString && valueFiatString !== ".") {
      (async () => {
        try {
          setLoading(true);
          const rate = await getCurrencyRate();
          if (!rate) {
            setError(tCommon("error") + ": Failed to fetch currency rate");
            console.error("Failed to fetch currency rate.");
            setValueSat("");
            return;
          }

          const fiatNumericValue = parseFloat(valueFiatString);
          if (isNaN(fiatNumericValue)) {
            setError(tCommon("error") + ": Invalid amount");
            setValueSat("");
            return;
          }

          const calculatedSats = Math.floor(
            (fiatNumericValue / rate) * numSatsInBtc
          );

          if (
            invoiceAttributes.minimumAmount &&
            calculatedSats <
              (typeof invoiceAttributes.minimumAmount === "string"
                ? parseInt(invoiceAttributes.minimumAmount)
                : invoiceAttributes.minimumAmount)
          ) {
            setError(t("errors.amount_too_small"));
            setValueSat("");
            return;
          } else if (
            invoiceAttributes.maximumAmount &&
            calculatedSats >
              (typeof invoiceAttributes.maximumAmount === "string"
                ? parseInt(invoiceAttributes.maximumAmount)
                : invoiceAttributes.maximumAmount)
          ) {
            setError(t("errors.amount_too_big"));
            setValueSat("");
            return;
          } else {
            setError("");
          }

          setValueSat(calculatedSats.toString());
        } catch (e) {
          console.error("Error during fiat to sats conversion:", e);
          if (e instanceof Error) setError(tCommon("error") + ": " + e.message);
          else setError(tCommon("error") + ": Conversion failed");
          setValueSat("");
        } finally {
          setLoading(false);
        }
      })();
    } else if (!isSatsPrimary && !valueFiatString) {
      setValueSat("");
      setError("");
    }
  }, [
    valueFiatString,
    isSatsPrimary,
    getCurrencyRate,
    invoiceAttributes.minimumAmount,
    invoiceAttributes.maximumAmount,
    t,
    tCommon,
    setLoading,
  ]);

  function handleValueChange(amount: string) {
    setError("");
    if (
      invoiceAttributes.minimumAmount &&
      parseInt(amount) <
        (typeof invoiceAttributes.minimumAmount === "string"
          ? parseInt(invoiceAttributes.minimumAmount)
          : invoiceAttributes.minimumAmount)
    ) {
      setError(t("errors.amount_too_small"));
    } else if (
      invoiceAttributes.maximumAmount &&
      parseInt(amount) >
        (typeof invoiceAttributes.maximumAmount === "string"
          ? parseInt(invoiceAttributes.maximumAmount)
          : invoiceAttributes.maximumAmount)
    ) {
      setError(t("errors.amount_too_big"));
    }
    setValueSat(amount);
    setIsSatsPrimary(true);
  }

  function handleFiatInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    if (/^\d*\.?\d*$/.test(newValue)) {
      setValueFiatString(newValue);
      setIsSatsPrimary(false);
    }
  }

  function handleMemoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMemo(e.target.value);
  }

  async function confirm() {
    if (!valueSat) return;
    try {
      setLoading(true);
      const response = await api.makeInvoice({
        amount: valueSat,
        memo: memo,
      });
      msg.reply(response);
    } catch (e) {
      if (e instanceof Error) toast.error(`${tCommon("error")}: ${e.message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function reject(e: React.MouseEvent) {
    e.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    confirm();
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      <form onSubmit={handleSubmit} className="h-full">
        <Container justifyBetween maxWidth="sm">
          <div>
            <PublisherCard
              title={origin.name}
              image={origin.icon}
              url={origin.host}
            />

            <div className="pt-4">
              <div>
                {amountEditable ? (
                  <div className="mb-4">
                    <DualCurrencyField
                      id="amount"
                      label={t("amount.label")}
                      min={invoiceAttributes.minimumAmount}
                      max={invoiceAttributes.maximumAmount}
                      value={valueSat}
                      onChange={(e) => handleValueChange(e.target.value)}
                      fiatValue={fiatValue}
                    />
                    <SatButtons onClick={handleValueChange} />
                    {showFiat && (
                      <TextField
                        id="fiatAmount"
                        label="Fiat Amount (e.g., USD)"
                        value={valueFiatString}
                        onChange={handleFiatInputChange}
                        placeholder="Enter amount in your local currency"
                      />
                    )}
                  </div>
                ) : (
                  <dl className="overflow-hidden">
                    <Dt>{t("amount.label")}</Dt>
                    <Dd>{invoiceAttributes.amount}</Dd>
                  </dl>
                )}

                {error && <p className="mb-1 text-red-500">{error}</p>}
              </div>

              <div className="mb-4">
                {memoEditable ? (
                  <TextField
                    id="memo"
                    label={t("memo.label")}
                    value={memo}
                    placeholder={tCommon("optional")}
                    onChange={handleMemoChange}
                  />
                ) : (
                  <dl className="dark:bg-surface-02dp overflow-hidden">
                    <Dt>{t("memo.label")}</Dt>
                    <Dd>{invoiceAttributes.memo}</Dd>
                  </dl>
                )}
              </div>
            </div>
          </div>
          <ConfirmOrCancel
            disabled={!valueSat || loading || Boolean(error)}
            loading={loading}
            onCancel={reject}
          />
        </Container>
      </form>
    </div>
  );
}

export default MakeInvoice;
