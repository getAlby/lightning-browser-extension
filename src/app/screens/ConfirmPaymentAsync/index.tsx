import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PaymentSummary from "@components/PaymentSummary";
import PublisherCard from "@components/PublisherCard";
import lightningPayReq from "bolt11-signet";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Alert from "~/app/components/Alert";
import Hyperlink from "~/app/components/Hyperlink";
import ScreenHeader from "~/app/components/ScreenHeader";
import toast from "~/app/components/Toast";
import { useSettings } from "~/app/context/SettingsContext";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";

function ConfirmPaymentAsync() {
  const {
    isLoading: isLoadingSettings,
    settings,
    getFormattedFiat,
  } = useSettings();

  const showFiat = !isLoadingSettings && settings.showFiat;

  const { t } = useTranslation("translation", {
    keyPrefix: "confirm_payment_async",
  });

  const navState = useNavigationState();
  const paymentRequest = navState.args?.paymentRequest as string;
  const invoice = lightningPayReq.decode(paymentRequest);

  const navigate = useNavigate();

  const [fiatAmount, setFiatAmount] = useState("");

  useEffect(() => {
    (async () => {
      if (showFiat && invoice.satoshis) {
        const res = await getFormattedFiat(invoice.satoshis);
        setFiatAmount(res);
      }
    })();
  }, [invoice.satoshis, showFiat, getFormattedFiat]);

  const [loading, setLoading] = useState(false);

  async function confirm() {
    try {
      setLoading(true);
      const response = await api.sendPaymentAsync(
        paymentRequest,
        navState.origin
      );

      if ("error" in response) {
        throw new Error(response.error);
      }

      msg.reply(response);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function reject(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (navState.isPrompt) {
      msg.error(USER_REJECTED_ERROR);
    } else {
      navigate(-1);
    }
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
            {navState.origin && (
              <PublisherCard
                title={navState.origin.name}
                image={navState.origin.icon}
                url={navState.origin.host}
              />
            )}
            <div className="my-4">
              <div className="mb-4 p-4 shadow bg-white dark:bg-surface-02dp rounded-lg">
                <PaymentSummary
                  amount={invoice.satoshis || "0"} // TODO: allow entering amount or do not allow zero-amount invoices
                  fiatAmount={fiatAmount}
                  description={invoice.tagsObject.description}
                />
              </div>
            </div>
            <div className="my-4">
              <Alert type="info">
                <Trans
                  i18nKey={"description"}
                  t={t}
                  components={[
                    // eslint-disable-next-line react/jsx-key
                    <Hyperlink
                      href="https://guides.getalby.com/user-guide/v/alby-account-and-browser-extension/alby-browser-extension/features/hold-payments"
                      target="_blank"
                      rel="noopener nofollow"
                      className="dark:text-white underline font-medium"
                    />,
                  ]}
                />
              </Alert>
            </div>
          </div>
          <div>
            <ConfirmOrCancel
              disabled={loading}
              loading={loading}
              onCancel={reject}
              label={t("actions.pay_now")}
            />
          </div>
        </Container>
      </form>
    </div>
  );
}

export default ConfirmPaymentAsync;
