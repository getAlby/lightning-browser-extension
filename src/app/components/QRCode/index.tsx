import { PopiconsCopyLine } from "@popicons/react";
import ReactQRCode from "react-qr-code";
import React from "react";
import { useTranslation } from "react-i18next";
import toast from "~/app/components/Toast";
import { classNames, useTheme } from "~/app/utils";

export type Props = {
  value: string;
  size?: number;
  className?: string;

  // set the level to Q if there are overlays
  // Q will improve error correction (so we can add overlays covering up to 25% of the QR)
  // at the price of decreased information density (meaning the QR codes "pixels" have to be
  // smaller to encode the same information).
  // While that isn't that much of a problem for lightning addresses (because they are usually quite short),
  // for invoices that contain larger amount of data those QR codes can get "harder" to read.
  // (meaning you have to aim your phone very precisely and have to wait longer for the reader
  // to recognize the QR code)
  level?: "Q" | undefined;
};

export default function QRCode({ value, size, level, className }: Props) {
  const theme = useTheme();
  const { t } = useTranslation("common");

  const fgColor = theme === "dark" ? "#FFFFFF" : "#000000";
  const bgColor = theme === "dark" ? "#000000" : "#FFFFFF";

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation(); // Stop the click from bubbling up
    navigator.clipboard.writeText(value);
    toast.success(t("copied"));
  }

  return (
    <div
      onClick={handleCopy}
      className={classNames(
        "relative group cursor-pointer inline-block",
        className ?? ""
      )}
    >
      <ReactQRCode
        value={value}
        size={size}
        fgColor={fgColor}
        bgColor={bgColor}
        className="w-full h-auto rounded-md"
        level={level}
      />

      {/* Overlay: Hidden by default (opacity-0), Visible on hover (opacity-100) */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md">
        <div className="bg-white dark:bg-neutral-800 p-2 rounded-full shadow-lg">
          <PopiconsCopyLine className="w-6 h-6 text-neutral-800 dark:text-white" />
        </div>
      </div>
    </div>
  );
}
