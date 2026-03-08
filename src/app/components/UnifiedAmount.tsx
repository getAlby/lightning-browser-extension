import React, { useEffect, useState } from "react";
import { useSettings } from "~/app/context/SettingsContext";

interface UnifiedAmountProps {
  sats: number | string;
  className?: string;
  primary?: "sats" | "fiat"; // Main value to display prominently
  showSecondary?: boolean; // Display the alternative currency as secondary text
}

/**
 * UnifiedAmount Component
 *
 * Centralizes the display of BTC/Sats and Fiat values.
 * Uses SettingsContext for rates and formatting preferences.
 *
 * Quality features:
 * - Skeleton loading state
 * - Defensive validation against NaN/invalid inputs
 * - Professional layout with secondary value support
 */
const UnifiedAmount: React.FC<UnifiedAmountProps> = ({
  sats,
  className = "",
  primary = "sats",
  showSecondary = true,
}) => {
  const { settings, getFormattedFiat, getFormattedSats, isLoading } =
    useSettings();
  const [fiatValue, setFiatValue] = useState<string | null>(null);

  const amountSats = Number(sats);
  // Defensive validation: ensure finite number before formatting
  const safeSats = Number.isFinite(amountSats) ? amountSats : 0;
  const formattedSats = getFormattedSats(safeSats);

  useEffect(() => {
    let isMounted = true;
    if (settings.showFiat && safeSats > 0) {
      getFormattedFiat(safeSats).then((val) => {
        if (isMounted) setFiatValue(val);
      });
    } else {
      setFiatValue(null);
    }
    return () => {
      isMounted = false;
    };
  }, [safeSats, settings.showFiat, getFormattedFiat]);

  if (isLoading)
    return (
      <span
        className="animate-pulse bg-gray-200 rounded w-16 h-4 inline-block"
        role="status"
        aria-label="Loading amount"
      />
    );

  const fiatActive = settings.showFiat && fiatValue;

  const renderPrimary = () => {
    if (primary === "fiat" && fiatActive) {
      return <span className="font-bold">{fiatValue}</span>;
    }
    return <span className="font-bold">{formattedSats}</span>;
  };

  const renderSecondary = () => {
    if (!showSecondary) return null;

    if (primary === "sats" && fiatActive) {
      return <span className="text-gray-500 text-sm ml-1">({fiatValue})</span>;
    }
    if (primary === "fiat" && fiatActive) {
      return (
        <span className="text-gray-500 text-sm ml-1">({formattedSats})</span>
      );
    }
    return null;
  };

  return (
    <div className={`inline-flex items-baseline ${className}`}>
      {renderPrimary()}
      {renderSecondary()}
    </div>
  );
};

export default UnifiedAmount;
