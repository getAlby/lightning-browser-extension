import { useTranslation } from "react-i18next";

export default function ConnectionErrorToast({ message }: { message: string }) {
  const { t } = useTranslation("components", {
    keyPrefix: "toasts.connection_error",
  });
  return (
    <>
      <p className="mb-2">
        {t("connection_failed")}
        <br />(<span className="italic">{message}</span>)
      </p>
      <p>
        <a
          href="https://guides.getalby.com/overall-guide/alby-browser-extension/connect-lightning-wallets-and-nodes-to-alby-extension"
          className="underline"
          target="_blank"
        >
          {t("help_link")}
        </a>
      </p>
    </>
  );
}
