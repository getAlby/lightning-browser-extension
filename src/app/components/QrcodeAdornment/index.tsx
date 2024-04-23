import { PopiconsQrCodeMinimalLine } from "@popicons/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

type Props = {
  route: string;
};

export default function QrcodeAdornment({ route }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation("components", {
    keyPrefix: "qrcode_scanner",
  });
  return (
    <button
      aria-label={t("title")}
      type="button"
      className="flex justify-center items-center p-2"
      onClick={() => {
        navigate("/scanQRCode", { state: { route: route }, replace: true });
      }}
    >
      <PopiconsQrCodeMinimalLine className="h-5 w-5 text-blue-600" />
    </button>
  );
}
