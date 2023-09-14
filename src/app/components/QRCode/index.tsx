import ReactQRCode from "react-qr-code";
import { classNames, useTheme } from "~/app/utils";

export type Props = {
  value: string;
  size?: number;
  className?: string;
};

export default function QRCode({ value, size, className }: Props) {
  const theme = useTheme();
  const fgColor = theme === "dark" ? "#FFFFFF" : "#000000";
  const bgColor = theme === "dark" ? "#000000" : "#FFFFFF";

  return (
    <ReactQRCode
      value={value}
      size={size}
      className={classNames("rounded-md", className ?? "")}
      fgColor={fgColor}
      bgColor={bgColor}
      level="M"
    />
  );
}
