import { CrossIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
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
        title={t("title")}
        headerRight={
          <IconButton
            onClick={() => navigate(-1)}
            icon={<CrossIcon className="w-4 h-4" />}
          />
        }
      />
      <Container maxWidth="sm">
        <QrcodeScanner
          qrbox={200}
          qrCodeSuccessCallback={(decodedText) => {
            if (decodedText) {
              navigate(
                `/${route}`,

                { state: { decodedText: decodedText }, replace: true }
              );
            }
          }}
          qrCodeErrorCallback={console.error}
        />
      </Container>
    </div>
  );
}
