import { useTranslation } from "react-i18next";

export default function ConnectionErrorToast({
  message,
  link,
}: {
  message: string;
  link?: string;
}) {
  const { t } = useTranslation("components", {
    keyPrefix: "toasts.connection_error",
  });
  const { t: tCommon } = useTranslation("common");
  return (
    <>
      <p className="mb-2">
        {tCommon("errors.connection_failed")}
        <br />(<span className="italic text-sm">{message}</span>)
      </p>
      <p className="my-2 text-sm">{t("what_you_can_do")}</p>
      <ul className="list-disc text-sm list-inside">
        <li>{t("double_check")}</li>
        {link && (
          <li>
            {tCommon("actions.open")}{" "}
            <a
              href={link}
              className="underline"
              target="_blank"
              rel="noreferrer noopener"
            >
              {link.substring(0, 21)}...
            </a>{" "}
            {t("if_ssl_errors")}
          </li>
        )}
        <li>
          <a
            href="https://guides.getalby.com/overall-guide/alby-browser-extension/connect-lightning-wallets-and-nodes-to-alby-extension"
            className="underline"
            target="_blank"
            rel="noreferrer noopener"
          >
            {t("visit_guides")}
          </a>
        </li>
      </ul>
    </>
  );
}
