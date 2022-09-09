import { useTranslation } from "react-i18next";

export default function LoginFailedToast({
  passwordResetUrl,
}: {
  passwordResetUrl: string;
}) {
  const { t } = useTranslation("components", {
    keyPrefix: "toasts",
  });
  return (
    <>
      <p className="mb-2">{t("errors.invalid_credentials")}</p>
      <p>
        <a
          href={passwordResetUrl}
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          {t("login_failed.password_reset")}
        </a>
      </p>
    </>
  );
}
