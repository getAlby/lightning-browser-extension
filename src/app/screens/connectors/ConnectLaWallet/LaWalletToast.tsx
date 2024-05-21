import { Trans, useTranslation } from "react-i18next";

export default function LaWalletToast({ domain }: { domain: string }) {
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.lawallet.errors.toast",
  });

  return (
    <>
      <p className="text-md font-medium">
        {t("title")} (
        <span className="text-sm">{t("message", { domain })}</span>)
      </p>

      <p className="my-3 text-md">{t("verify")}</p>
      <ul className="list-disc text-sm list-inside">
        <li>{t("match")}</li>
        <li>
          <Trans
            i18nKey={"walias"}
            t={t}
            values={{ domain }}
            components={[<b key="walias-strong"></b>]}
          />
        </li>
        <li>
          <Trans
            i18nKey={"endpoint"}
            t={t}
            values={{ domain }}
            components={[<b key="endpoint-strong"></b>]}
          />
        </li>
        <li>
          <Trans
            i18nKey={"http"}
            t={t}
            components={[<b key="http-strong"></b>]}
          />
        </li>
      </ul>
    </>
  );
}
