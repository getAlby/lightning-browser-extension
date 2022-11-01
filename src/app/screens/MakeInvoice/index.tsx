import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import SatButtons from "@components/SatButtons";
import TextField from "@components/form/TextField";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import type { OriginData, RequestInvoiceArgs } from "~/types";

const Dt = ({ children }: { children: React.ReactNode }) => (
  <dt className="font-medium text-gray-800 dark:text-white">{children}</dt>
);

const Dd = ({ children }: { children: React.ReactNode }) => (
  <dd className="mb-4 text-gray-600 dark:text-neutral-500">{children}</dd>
);

function MakeInvoice() {
  const navState = useNavigationState();
  const origin = navState.origin as OriginData;
  const invoiceAttributes = navState.args
    ?.invoiceAttributes as RequestInvoiceArgs;
  const amountEditable = navState.args?.amountEditable;
  const memoEditable = navState.args?.memoEditable;
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(invoiceAttributes.amount || "");
  const [memo, setMemo] = useState(invoiceAttributes.memo || "");
  const [error, setError] = useState("");
  const { t: tComponents } = useTranslation("components");
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "make_invoice",
  });

  function handleValueChange(amount: string) {
    setError("");
    if (
      invoiceAttributes.minimumAmount &&
      parseInt(amount) < invoiceAttributes.minimumAmount
    ) {
      setError(t("errors.amount_too_small"));
    } else if (
      invoiceAttributes.maximumAmount &&
      parseInt(amount) > invoiceAttributes.maximumAmount
    ) {
      setError(t("errors.amount_too_big"));
    }
    setValue(amount);
  }

  function handleMemoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMemo(e.target.value);
  }

  async function confirm() {
    if (!value) return;
    try {
      setLoading(true);
      const response = await api.makeInvoice({
        amount: value,
        memo: memo,
      });
      msg.reply(response);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function reject(e: React.MouseEvent) {
    e.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />

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
                  {/* 
                    TODO: https://github.com/getAlby/lightning-browser-extension/issues/1666
                    [Feature] MakeInvoice - switch currency TextField to DualCurrency field to support Fiat #1666 
                   */}
                  <TextField
                    id="amount"
                    label={t("amount.label")}
                    type="number"
                    min={invoiceAttributes.minimumAmount}
                    max={invoiceAttributes.maximumAmount}
                    value={value}
                    onChange={(e) => handleValueChange(e.target.value)}
                  />
                  <SatButtons onClick={handleValueChange} />
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

        <div>
          <ConfirmOrCancel
            disabled={!value || loading || Boolean(error)}
            loading={loading}
            onConfirm={confirm}
            onCancel={reject}
          />

          <p className="mb-4 text-center text-sm text-gray-400">
            <em>{tComponents("confirm_or_cancel.only_trusted")}</em>
          </p>
        </div>
      </Container>
    </div>
  );
}

export default MakeInvoice;
