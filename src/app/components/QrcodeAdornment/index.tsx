import { QrCodeIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { useNavigate } from "react-router-dom";

type Props = {
  route: string;
};

export default function QrcodeAdornment({ route }: Props) {
  const navigate = useNavigate();
  return (
    <button
      aria-label="Scan QR"
      type="button"
      className="flex justify-center items-center w-10 h-8"
      onClick={() => {
        navigate("/scanQRCode", { state: { route: route }, replace: true });
      }}
    >
      <QrCodeIcon className="h-6 w-6 text-blue-600" />
    </button>
  );
}
