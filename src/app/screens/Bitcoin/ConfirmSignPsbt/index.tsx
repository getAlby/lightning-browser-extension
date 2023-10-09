import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import { TFunction } from "i18next";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Hyperlink from "~/app/components/Hyperlink";
import Loading from "~/app/components/Loading";
import ScreenHeader from "~/app/components/ScreenHeader";
import toast from "~/app/components/Toast";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import type { Address, OriginData, PsbtPreview } from "~/types";

function ConfirmSignPsbt() {
  const navState = useNavigationState();
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "bitcoin.confirm_sign_psbt",
  });
  const navigate = useNavigate();

  const psbt = navState.args?.psbt as string;
  const origin = navState.origin as OriginData;
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [preview, setPreview] = useState<PsbtPreview | undefined>(undefined);
  const [showAddresses, setShowAddresses] = useState(false);
  const [showHex, setShowHex] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      try {
        const preview = await api.bitcoin.getPsbtPreview(psbt);
        setPreview(preview);
      } catch (e) {
        console.error(e);
        const error = e as { message: string };
        const errorMessage = error.message || "Unknown error";
        setError(errorMessage);
        toast.error(`${tCommon("error")}: ${errorMessage}`);
      }
    })();
  }, [origin, psbt, tCommon]);

  async function confirm() {
    try {
      setLoading(true);
      const response = await api.bitcoin.signPsbt(psbt);
      msg.reply(response);
      setSuccessMessage(tCommon("success"));
    } catch (e) {
      console.error(e);
      const error = e as { message: string };
      const errorMessage = error.message || "Unknown error";
      toast.error(`${tCommon("error")}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  function reject(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  function close(e: React.MouseEvent<HTMLButtonElement>) {
    if (navState.isPrompt) {
      window.close();
    } else {
      e.preventDefault();
      navigate(-1);
    }
  }

  function toggleShowAddresses() {
    setShowAddresses((current) => !current);
  }
  function toggleShowHex() {
    setShowHex((current) => !current);
  }

  if (error) {
    return <p className="dark:text-white">{error}</p>;
  }

  if (!preview) {
    return <Loading />;
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <ScreenHeader title={t("title")} />
      {!successMessage ? (
        <Container justifyBetween maxWidth="sm">
          <div className="flex flex-col gap-4 mb-4">
            <PublisherCard
              title={origin.name}
              image={origin.icon}
              url={origin.host}
            />
            <div className="p-4 shadow bg-white dark:bg-surface-02dp rounded-lg overflow-hidden flex flex-col gap-4">
              <h2 className="font-medium dark:text-white">
                {t("allow_sign", { host: origin.host })}
              </h2>
              <div className="flex gap-2">
                <Hyperlink onClick={toggleShowAddresses}>
                  {showAddresses ? t("hide_details") : t("view_details")}
                </Hyperlink>
              </div>

              {showAddresses && (
                <>
                  <p className="font-medium dark:text-white">{t("inputs")}</p>
                  <div className="flex flex-col gap-4">
                    {preview.inputs.map((input) => (
                      <AddressPreview key={input.address} t={t} {...input} />
                    ))}
                  </div>
                  <p className="font-medium dark:text-white">{t("outputs")}</p>
                  <div className="flex flex-col gap-4">
                    {preview.outputs.map((output) => (
                      <AddressPreview key={output.address} t={t} {...output} />
                    ))}
                  </div>
                  <p className="font-medium dark:text-white">{t("fee")}</p>
                  <p className="font-medium text-sm text-gray-500 dark:text-gray-400">
                    {t("amount", { amount: preview.fee })}
                  </p>

                  <Hyperlink onClick={toggleShowHex}>
                    {showHex
                      ? t("hide_raw_transaction")
                      : t("view_raw_transaction")}
                  </Hyperlink>
                </>
              )}
            </div>

            {showHex && (
              <div className="break-all p-2 mb-4 shadow bg-white rounded-lg dark:bg-surface-02dp text-gray-500 dark:text-gray-400">
                {psbt}
              </div>
            )}
          </div>
          <ConfirmOrCancel
            disabled={loading}
            loading={loading}
            onConfirm={confirm}
            onCancel={reject}
          />
        </Container>
      ) : (
        <Container maxWidth="sm">
          <PublisherCard
            title={origin.name}
            image={origin.icon}
            url={origin.host}
          />
          <SuccessMessage message={successMessage} onClose={close} />
        </Container>
      )}
    </div>
  );
}

function AddressPreview({
  address,
  amount,
  t,
}: Address & {
  t: TFunction<"translation", "bitcoin.confirm_sign_psbt", "translation">;
}) {
  return (
    <div>
      <p className="text-gray-500 dark:text-gray-400 break-all">{address}</p>
      <p className="font-medium text-sm text-gray-500 dark:text-gray-400">
        {t("amount", { amount })}
      </p>
    </div>
  );
}

export default ConfirmSignPsbt;
