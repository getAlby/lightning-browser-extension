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
  return (
    <>
      <p className="mb-2">
        {t("connection_failed")}
        <br />(<span className="italic text-sm">{message}</span>)
      </p>
      <p className="my-2 text-sm">Here is what you can do:</p>
      <ul className="list-disc text-sm list-inside">
        <li>Double check your connection details</li>
        {link && (
          <li>
            Open{" "}
            <a
              href={link}
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              {link.substring(0, 21)}...
            </a>{" "}
            and if there are SSL errors (e.g. ERR_CERT_AUTHORITY_INVALID), click
            &quot;advanced&quot; and proceed to accept the certificate.
          </li>
        )}
        <li>
          <a
            href="https://guides.getalby.com/overall-guide/alby-browser-extension/connect-lightning-wallets-and-nodes-to-alby-extension"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            Visit our guides for more help
          </a>
        </li>
      </ul>
    </>
  );
}
