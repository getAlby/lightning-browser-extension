import { useTranslation } from "react-i18next";

export default function LoginFailedToast({
  passwordResetUrl,
}: {
  passwordResetUrl: string;
}) {
  const { t } = useTranslation("components", {
    keyPrefix: "toasts.login_failed",
  });
  return (
    <>
      <p className="mb-2">{t("invalid_credentials")}</p>
      <p>
        <a
          href={passwordResetUrl}
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          {t("password_reset")}
        </a>
      </p>
    </>
  );
}
