import ReactQRCode from "react-qr-code";
import { useTheme } from "~/app/utils";

type Props = {
  value: string;
};

export default function QRCode({ value }: Props) {
  const theme = useTheme();
  const fgColor = theme === "light" ? "#FFFFFF" : "#000000";
  const bgColor = theme === "light" ? "#000000" : "#FFFFFF";

  return (
    <ReactQRCode value={value} level="M" bgColor={bgColor} fgColor={fgColor} />
  );
}
