import ConfirmOrCancel from "@components/ConfirmOrCancel";
import Container from "@components/Container";
import PublisherCard from "@components/PublisherCard";
import SuccessMessage from "@components/SuccessMessage";
import {
  PopiconsChevronBottomLine,
  PopiconsChevronTopLine,
} from "@popicons/react";
import { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Hyperlink from "~/app/components/Hyperlink";
import Loading from "~/app/components/Loading";
import ScreenHeader from "~/app/components/ScreenHeader";
import toast from "~/app/components/Toast";
import { useNavigationState } from "~/app/hooks/useNavigationState";
import PopiconsCircleInfoLine from "~/app/icons/popicons/CircleInfoLine";
import { USER_REJECTED_ERROR } from "~/common/constants";
import api from "~/common/lib/api";
import msg from "~/common/lib/msg";
import type {
  EsploraAssetInfos,
  EsploraAssetRegistry,
  LiquidAddress,
  OriginData,
  PsetPreview,
} from "~/types";

function ConfirmSignPset() {
  const navState = useNavigationState();
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("translation", {
    keyPrefix: "confirm_sign_pset",
  });
  const navigate = useNavigate();

  const pset = navState.args?.pset;
  const origin = navState.origin as OriginData;
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [preview, setPreview] = useState<PsetPreview | undefined>(undefined);
  const [assetRegistry, setAssetRegistry] = useState<EsploraAssetRegistry>({});
  const [showDetails, setShowAddresses] = useState(false);
  const [showRawTransaction, setShowHex] = useState(false);

  useEffect(() => {
    (async () => {
      if (!pset) throw new Error("pset is undefined");
      const preview = await api.liquid.getPsetPreview(pset);
      setPreview(preview);

      const registry = await api.liquid.fetchAssetRegistry(preview);
      setAssetRegistry(registry);
    })();
  }, [pset]);

  async function confirm() {
    try {
      if (!pset) throw new Error("pset is undefined");
      setLoading(true);
      const response = await api.liquid.signPset(pset);

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
            <div className="p-4 shadow bg-white dark:bg-surface-02dp rounded-lg overflow-hidden flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h2 className="font-medium dark:text-white">
                  {t("allow_sign", { host: origin.host })}{" "}
                </h2>
                <Hyperlink
                  href="https://guides.getalby.com/user-guide/v/alby-account-and-browser-extension/alby-browser-extension/features/liquid"
                  target="_blank"
                >
                  <div className="bg-blue-500 rounded-full">
                    <PopiconsCircleInfoLine className="h-4 w-4 text-white" />
                  </div>
                </Hyperlink>
              </div>
            </div>
            <div
              className="flex w-full justify-center items-center"
              onClick={toggleShowAddresses}
            >
              {tCommon("details")}
              {showDetails ? (
                <PopiconsChevronTopLine className="h-4 w-4 inline-flex" />
              ) : (
                <PopiconsChevronBottomLine className="h-4 w-4 inline-flex" />
              )}
            </div>

            {showDetails && (
              <>
                <div className="p-4 shadow bg-white dark:bg-surface-02dp rounded-lg overflow-hidden flex flex-col gap-4">
                  <div>
                    <p className="font-medium dark:text-white">{t("inputs")}</p>
                    <div className="flex flex-col gap-4">
                      {preview.inputs.map((input, index) => (
                        <AddressPreview
                          key={index}
                          assetInfos={assetRegistry[input.asset]}
                          t={t}
                          {...input}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium dark:text-white">
                      {t("outputs")}
                    </p>
                    <div className="flex flex-col gap-4">
                      {preview.outputs.map((output, index) => (
                        <AddressPreview
                          key={index}
                          assetInfos={assetRegistry[output.asset]}
                          t={t}
                          {...output}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex w-full justify-center">
                  <Hyperlink onClick={toggleShowHex}>
                    {showRawTransaction
                      ? t("hide_raw_transaction")
                      : t("view_raw_transaction")}
                  </Hyperlink>
                </div>
              </>
            )}

            {showRawTransaction && (
              <div className="break-all p-2 mb-4 shadow bg-white rounded-lg dark:bg-surface-02dp text-gray-500 dark:text-gray-400">
                {pset}
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
  asset,
  assetInfos,
  t,
}: LiquidAddress & {
  assetInfos?: EsploraAssetInfos;
  t: TFunction<"translation", "confirm_sign_pset">;
}) {
  // if assetInfos is not provided, we fallback to a custom ticker based on the asset hash
  const ticker = assetInfos?.ticker ?? asset.slice(0, 5).toUpperCase();
  const isUnknownTicker = !assetInfos?.ticker;
  const precision =
    assetInfos?.precision === undefined ? 8 : assetInfos.precision;
  const decimalAmount = amount * 10 ** -precision;
  return (
    <div>
      <p className="text-gray-500 dark:text-gray-400 break-all">{address}</p>
      <p className="font-medium text-sm text-gray-500 dark:text-gray-400">
        {t("amount", { amount: decimalAmount.toFixed(precision), ticker })}{" "}
        {isUnknownTicker && " (unknown ticker)"}
      </p>
    </div>
  );
}

export default ConfirmSignPset;
