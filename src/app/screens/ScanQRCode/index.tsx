import { PopiconsXLine } from "@popicons/react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import Container from "~/app/components/Container";
import Header from "~/app/components/Header";
import IconButton from "~/app/components/IconButton";
import QrcodeScanner from "~/app/components/QrcodeScanner";

export default function ScanQRCode() {
  const { t } = useTranslation("translation", { keyPrefix: "scan_qrcode" });
  const navigate = useNavigate();
  const location = useLocation();
  const route = location.state?.route;

  return (
    <div>
      <Header
        headerRight={
          <IconButton
            onClick={() =>
              navigate(
                `/${route}`,

                { replace: true }
              )
            }
            icon={<PopiconsXLine className="w-4 h-4" />}
          />
        }
      >
        {t("title")}
      </Header>
      <Container maxWidth="sm">
        <QrcodeScanner
          qrbox={200}
          qrCodeSuccessCallback={(decodedText) => {
            if (decodedText) {
              navigate(
                `/${route}`,

                { state: { decodedQR: decodedText }, replace: true }
              );
            }
          }}
          qrCodeErrorCallback={console.error}
        />
      </Container>
    </div>
  );
}
