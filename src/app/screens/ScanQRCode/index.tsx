import { CrossIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Container from "~/app/components/Container";
import Header from "~/app/components/Header";
import IconButton from "~/app/components/IconButton";
import QrcodeScanner from "~/app/components/QrcodeScanner";

export default function ScanQRCode() {
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate();

  return (
    <div>
      <Header
        title={tCommon("qrcode.title")}
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
              navigate("/lnurlRedeem", { state: { decodedText: decodedText } });
            }
          }}
          qrCodeErrorCallback={console.error}
        />
      </Container>
    </div>
  );
}
