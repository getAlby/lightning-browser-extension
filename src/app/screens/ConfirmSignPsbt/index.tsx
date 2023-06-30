import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Hyperlink from "~/app/components/Hyperlink";
import Loading from "~/app/components/Loading";
import ScreenHeader from "~/app/components/ScreenHeader";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import { Address, PsbtPreview, getPsbtPreview } from "~/common/lib/psbt";
import type { OriginData } from "~/types";

function ConfirmSignPsbt() {
  const navState = useNavigationState();
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "confirm_sign_psbt",
  });
  const navigate = useNavigate();

  const psbt = navState.args?.psbt as string;
  const origin = navState.origin as OriginData;
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [preview, setPreview] = useState<PsbtPreview | undefined>(undefined);
  const [showAddresses, setShowAddresses] = useState(false);
  const [showHex, setShowHex] = useState(false);

  useEffect(() => {
    (async () => {
      const settings = await api.getSettings();
      setPreview(getPsbtPreview(psbt, settings.bitcoinNetwork));
    })();
  }, [origin, psbt]);

  async function confirm() {
    try {
      setLoading(true);
      const response = await msg.request("signPsbt", { psbt }, { origin });
      msg.reply(response);
      setSuccessMessage(tCommon("success"));
    } catch (e) {
      console.error(e);
      if (e instanceof Error) toast.error(`${tCommon("error")}: ${e.message}`);
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
            <div className="rounded-md font-medium p-4 text-sm text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-900">
              {t("warning")}
            </div>
            <div className="p-4 shadow bg-white dark:bg-surface-02dp rounded-lg overflow-hidden flex flex-col gap-4">
              <h2 className="font-medium dark:text-white">
                {t("allow_sign", { host: origin.host })}
              </h2>
              <div className="flex gap-2">
                <Hyperlink onClick={toggleShowAddresses}>
                  {showAddresses ? t("hide_addresses") : t("view_addresses")}
                </Hyperlink>
                <span>{"•"}</span>
                <Hyperlink onClick={toggleShowHex}>
                  {showHex ? t("hide_hex") : t("view_hex")}
                </Hyperlink>
              </div>

              {showAddresses && (
                <div>
                  <p className="font-medium dark:text-white">{t("input")}</p>
                  <AddressPreview t={t} {...preview.inputs[0]} />
                </div>
              )}

              {showAddresses && (
                <div>
                  <p className="font-medium dark:text-white">{t("outputs")}</p>
                  <div className="flex flex-col gap-4">
                    {preview.outputs.map((output) => (
                      <AddressPreview key={output.address} t={t} {...output} />
                    ))}
                  </div>
                </div>
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
  t: TFunction<"translation", "confirm_sign_psbt", "translation">;
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
