import ReactQRCode from "react-qr-code";
import { classNames, useTheme } from "~/app/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CopyIcon } from "@bitcoin-design/bitcoin-icons-react/filled";

export type Props = {
  value: string;
  size?: number;
  className?: string;
  level?: "Q" | undefined;
  onCopy?: () => void;
};

export default function QRCode({ value, size, level, className, onCopy }: Props) {
  const theme = useTheme();
  const { t } = useTranslation("components", { keyPrefix: "qr_code" });
  const [isHovering, setIsHovering] = useState(false);
  const fgColor = theme === "dark" ? "#FFFFFF" : "#000000";
  const bgColor = theme === "dark" ? "#000000" : "#FFFFFF";

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    onCopy?.();
  };

  return (
    <div 
      className="relative cursor-pointer"
      onClick={handleCopy}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <ReactQRCode
        value={value}
        size={size}
        fgColor={fgColor}
        bgColor={bgColor}
        className={classNames(
          "w-full h-auto rounded-md transition-opacity",
          isHovering ? "opacity-80" : "opacity-100",
          className ?? ""
        )}
        level={level}
      />
      {isHovering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
          <div className="flex flex-col items-center">
            <CopyIcon className="h-8 w-8 text-white" />
            <span className="text-white font-medium mt-2">
              {t("click_to_copy")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}