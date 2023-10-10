import ReactQRCode from "react-qr-code";
import { classNames, useTheme } from "~/app/utils";

export type Props = {
  value: string;
  size?: number;
  className?: string;

  // set the level to Q if there are overlays
  level?: string;
};

export default function QRCode({ value, size, level, className }: Props) {
  const theme = useTheme();
  const fgColor = theme === "dark" ? "#FFFFFF" : "#000000";
  const bgColor = theme === "dark" ? "#000000" : "#FFFFFF";

  return (
    <ReactQRCode
      value={value}
      size={size}
      fgColor={fgColor}
      bgColor={bgColor}
      className={classNames("w-full h-auto rounded-md", className ?? "")}
      level={level}
    />
  );
}
