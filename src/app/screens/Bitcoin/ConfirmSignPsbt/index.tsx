import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import {
  PopiconsChevronBottomLine,
  PopiconsChevronTopLine,
} from "@popicons/react";
import { TFunction } from "i18next";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Hyperlink from "~/app/components/Hyperlink";
import Loading from "~/app/components/Loading";
import ScreenHeader from "~/app/components/ScreenHeader";
import toast from "~/app/components/Toast";
import { useSettings } from "~/app/context/SettingsContext";
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
  const { getFormattedSats } = useSettings();

  const psbt = navState.args?.psbt as string;
  const origin = navState.origin as OriginData;
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [preview, setPreview] = useState<PsbtPreview | undefined>(undefined);
  const [showAddresses, setShowAddresses] = useState(false);
  const [showHex, setShowHex] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const preview = await api.bitcoin.getPsbtPreview(psbt);
        setPreview(preview);
        setLoading(false);
      } catch (e) {
        console.error(e);
        const error = e as { message: string };
        const errorMessage = error.message || "Unknown error";
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

  if (!preview) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <Loading />
      </div>
    );
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
            </div>
            <div
              className="flex w-full justify-center items-center"
              onClick={toggleShowAddresses}
            >
              {tCommon("details")}
              {showAddresses ? (
                <PopiconsChevronTopLine className="h-4 w-4 inline-flex" />
              ) : (
                <PopiconsChevronBottomLine className="h-4 w-4 inline-flex" />
              )}
            </div>

            {showAddresses && (
              <>
                <div className="p-4 shadow bg-white dark:bg-surface-02dp rounded-lg overflow-hidden flex flex-col gap-4">
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
                    {getFormattedSats(preview.fee)}
                  </p>
                </div>
                <div className="flex w-full justify-center">
                  <Hyperlink onClick={toggleShowHex}>
                    {showHex
                      ? t("hide_raw_transaction")
                      : t("view_raw_transaction")}
                  </Hyperlink>
                </div>
              </>
            )}

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
  t: TFunction<"translation", "bitcoin.confirm_sign_psbt">;
}) {
  const { getFormattedSats } = useSettings();
  return (
    <div>
      <p className="text-gray-500 dark:text-gray-400 break-all">{address}</p>
      <p className="font-medium text-sm text-gray-500 dark:text-gray-400">
        {getFormattedSats(amount)}
      </p>
    </div>
  );
}

export default ConfirmSignPsbt;
